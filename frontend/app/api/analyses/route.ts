import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slideId = searchParams.get('slide_id')

    let query = supabase
      .from('analyses')
      .select('*, slides(filename)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (slideId) {
      query = query.eq('slide_id', slideId)
    }

    const { data: analyses, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ analyses })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slide_id, task } = body

    // Validate input
    if (!slide_id || !task) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check slide ownership
    const { data: slide, error: slideError } = await supabase
      .from('slides')
      .select('user_id, status')
      .eq('id', slide_id)
      .single()

    if (slideError || !slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
    }

    if (slide.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (slide.status !== 'ready') {
      return NextResponse.json(
        { error: 'Slide is not ready for analysis' },
        { status: 400 }
      )
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('slides_used_this_month, slides_limit')
      .eq('user_id', user.id)
      .single()

    if (subscription && subscription.slides_used_this_month >= subscription.slides_limit) {
      return NextResponse.json(
        { error: 'Monthly slide limit exceeded' },
        { status: 402 }
      )
    }

    // Create analysis record
    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        slide_id,
        user_id: user.id,
        task,
        status: 'queued',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger backend processing (async)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/analyses/${analysis.id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
      },
    }).catch(console.error)

    // Update usage
    await supabase
      .from('subscriptions')
      .update({
        slides_used_this_month: subscription
          ? subscription.slides_used_this_month + 1
          : 1,
      })
      .eq('user_id', user.id)

    return NextResponse.json({ analysis })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}