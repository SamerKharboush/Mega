'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  Activity,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

// Mock data
const stats = [
  { name: 'Slides Uploaded', value: '47', change: '+12 this month', icon: Upload },
  { name: 'Analyses Run', value: '156', change: '+34 this month', icon: Activity },
  { name: 'Reports Generated', value: '89', change: '+21 this month', icon: FileText },
  { name: 'Avg. Accuracy', value: '94.2%', change: '+2.1% improvement', icon: TrendingUp },
]

const recentAnalyses = [
  { id: '1', slide: 'lung_adeno_001.svs', task: 'Cancer Subtyping', status: 'done', confidence: 96 },
  { id: '2', slide: 'breast_her2_002.ndpi', task: 'IHC Quantification', status: 'running', confidence: null },
  { id: '3', slide: 'colon_msi_003.svs', task: 'Mutation Prediction', status: 'done', confidence: 89 },
  { id: '4', slide: 'lung_scc_004.tiff', task: 'Cancer Subtyping', status: 'queued', confidence: null },
  { id: '5', slide: 'melanoma_005.svs', task: 'Prognosis', status: 'error', confidence: null },
]

const subscription = {
  plan: 'Pro',
  slidesUsed: 47,
  slidesLimit: 500,
  renewalDate: 'April 15, 2024',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
        <p className="text-amber-400 text-sm font-medium">
          DEMO MODE — This page displays sample data. Connect your backend to see real results.
        </p>
      </div>

      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif">Welcome back, Dr. Smith</h2>
          <p className="text-cream/60 mt-1">Here's what's happening with your pathology analyses.</p>
        </div>
        <Link href="/slides">
          <Button className="bg-teal text-charcoal hover:bg-teal-600">
            <Upload className="w-4 h-4 mr-2" />
            Upload Slide
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-teal" />
                <span className="text-xs text-cream/40">{stat.change}</span>
              </div>
              <div className="mt-3">
                <div className="font-serif text-3xl">{stat.value}</div>
                <p className="text-sm text-cream/60 mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent analyses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Analyses</CardTitle>
              <Link href="/analyses" className="text-sm text-teal hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50 hover:bg-charcoal transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      analysis.status === 'done' ? 'bg-green-500' :
                      analysis.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      analysis.status === 'queued' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{analysis.slide}</p>
                      <p className="text-xs text-cream/40">{analysis.task}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {analysis.confidence && (
                      <span className="text-sm text-teal font-mono">
                        {analysis.confidence}% conf.
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      analysis.status === 'done' ? 'bg-green-500/10 text-green-500' :
                      analysis.status === 'running' ? 'bg-blue-500/10 text-blue-500' :
                      analysis.status === 'queued' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {analysis.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription</CardTitle>
            <CardDescription>
              {subscription.plan} plan • Renews {subscription.renewalDate}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-cream/60">Slides this month</span>
                <span>{subscription.slidesUsed} / {subscription.slidesLimit}</span>
              </div>
              <Progress value={(subscription.slidesUsed / subscription.slidesLimit) * 100} />
            </div>
            <div className="p-4 rounded-lg bg-charcoal-50">
              <div className="flex items-center gap-2 text-teal">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">All features unlocked</span>
              </div>
              <ul className="mt-2 text-xs text-cream/60 space-y-1">
                <li>• Cancer subtyping</li>
                <li>• Mutation prediction</li>
                <li>• IHC quantification</li>
                <li>• PDF reports</li>
                <li>• API access</li>
              </ul>
            </div>
            <Link href="/settings/billing">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover cursor-pointer group">
          <Link href="/slides">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center group-hover:bg-teal/20 transition-colors">
                <Upload className="w-6 h-6 text-teal" />
              </div>
              <div>
                <h3 className="font-medium">Upload New Slide</h3>
                <p className="text-sm text-cream/60">SVS, NDPI, TIFF, MRXS supported</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="card-hover cursor-pointer group">
          <Link href="/analyses">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center group-hover:bg-teal/20 transition-colors">
                <Activity className="w-6 h-6 text-teal" />
              </div>
              <div>
                <h3 className="font-medium">Run Analysis</h3>
                <p className="text-sm text-cream/60">Subtyping, mutation, IHC & more</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="card-hover cursor-pointer group">
          <Link href="/reports">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center group-hover:bg-teal/20 transition-colors">
                <FileText className="w-6 h-6 text-teal" />
              </div>
              <div>
                <h3 className="font-medium">Generate Report</h3>
                <p className="text-sm text-cream/60">PDF with predictions & heatmaps</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}