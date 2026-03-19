'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CreditCard, Download, Check, ArrowRight } from 'lucide-react'

const subscription = {
  plan: 'Pro',
  price: '€299',
  period: 'month',
  status: 'active',
  renewalDate: 'April 15, 2024',
  slidesUsed: 47,
  slidesLimit: 500,
}

const invoices = [
  { id: 'INV-2024-003', date: 'March 15, 2024', amount: '€299.00', status: 'paid' },
  { id: 'INV-2024-002', date: 'February 15, 2024', amount: '€299.00', status: 'paid' },
  { id: 'INV-2024-001', date: 'January 15, 2024', amount: '€299.00', status: 'paid' },
]

const plans = [
  { id: 'free', name: 'Free Trial', price: '€0', slides: '20/month', current: false },
  { id: 'pro', name: 'Pro', price: '€299', slides: '500/month', current: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', slides: 'Unlimited', current: false },
]

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl">Billing</h2>
        <p className="text-cream/60 mt-1">Manage your subscription and payment methods</p>
      </div>

      {/* Current plan */}
      <Card className="border-teal/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl">{subscription.plan}</span>
                <span className="text-xs bg-teal/20 text-teal px-2 py-1 rounded-full">
                  {subscription.status}
                </span>
              </div>
              <p className="text-cream/60 mt-1">
                {subscription.price}/{subscription.period} • Renews {subscription.renewalDate}
              </p>
            </div>
            <Button variant="outline">
              Manage Subscription
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-cream/60">Slides this month</span>
              <span>{subscription.slidesUsed} / {subscription.slidesLimit}</span>
            </div>
            <Progress value={(subscription.slidesUsed / subscription.slidesLimit) * 100} />
            <p className="text-xs text-cream/40">
              €0.50 per additional slide after limit
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plans comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Plans</CardTitle>
          <CardDescription>Compare plans and upgrade anytime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border-2 ${
                  plan.current
                    ? 'border-teal bg-teal/5'
                    : 'border-border hover:border-teal/50 transition-colors'
                }`}
              >
                {plan.current && (
                  <div className="flex items-center gap-1 text-teal text-xs mb-2">
                    <Check className="w-3 h-3" />
                    Current Plan
                  </div>
                )}
                <h3 className="font-medium">{plan.name}</h3>
                <div className="mt-1">
                  <span className="font-serif text-2xl">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-cream/40 text-sm">/month</span>
                  )}
                </div>
                <p className="text-sm text-cream/60 mt-2">{plan.slides}</p>
                {!plan.current && (
                  <Button
                    variant={plan.id === 'enterprise' ? 'outline' : 'default'}
                    size="sm"
                    className={`mt-4 w-full ${plan.id !== 'enterprise' ? 'bg-teal text-charcoal hover:bg-teal-600' : ''}`}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
          <CardDescription>Manage your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-cream/40">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoices</CardTitle>
          <CardDescription>Download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-charcoal-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{invoice.id}</p>
                  <p className="text-xs text-cream/40">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{invoice.amount}</span>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                    {invoice.status}
                  </span>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}