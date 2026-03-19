import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful login - redirect to dashboard
      const response = NextResponse.redirect(`${origin}${next}`)

      // Set the session cookies
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        response.cookies.set('sb-access-token', session.access_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
        response.cookies.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      }

      return response
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}