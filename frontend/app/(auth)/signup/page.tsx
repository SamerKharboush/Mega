'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Microscope, Loader2, Check } from 'lucide-react'

const plans = [
  { id: 'free', name: 'Free Trial', price: '€0', slides: '20 slides/month' },
  { id: 'pro', name: 'Pro', price: '€299', slides: '500 slides/month' },
] as const

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'plan' | 'confirm'>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    plan: 'free' as 'free' | 'pro',
  })

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError(null)
    setStep('plan')
  }

  const handleSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            organization: formData.organization,
            plan: formData.plan,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      if (formData.plan === 'pro') {
        // Redirect to Stripe checkout for Pro plan
        // In production, this would create a Stripe checkout session
        setStep('confirm')
      } else {
        setStep('confirm')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-teal" />
            </div>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification link to <span className="text-teal">{formData.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-cream/60">
            <p>Click the link in the email to activate your account.</p>
            <p className="mt-4">
              Already verified?{' '}
              <Link href="/login" className="text-teal hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center">
              <Microscope className="w-6 h-6 text-charcoal" />
            </div>
            <span className="font-serif text-2xl">Mega</span>
          </Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            {step === 'details' ? 'Enter your details to get started' : 'Choose your plan'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    placeholder="Dr. Jane Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    placeholder="Hospital name"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-teal text-charcoal hover:bg-teal-600">
                Continue
              </Button>
            </form>
          )}

          {step === 'plan' && (
            <div className="space-y-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: plan.id })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.plan === plan.id
                      ? 'border-teal bg-teal/10'
                      : 'border-border hover:border-teal/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-cream/60">{plan.slides}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-xl">{plan.price}</div>
                      <div className="text-xs text-cream/40">/month</div>
                    </div>
                  </div>
                </button>
              ))}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSignup}
                  disabled={loading}
                  className="flex-1 bg-teal text-charcoal hover:bg-teal-600"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <Link href="/login" className="text-teal hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}