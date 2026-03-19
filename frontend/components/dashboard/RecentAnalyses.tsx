'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface Analysis {
  id: string
  slide: string
  task: string
  status: 'queued' | 'running' | 'done' | 'error'
  confidence?: number
  created: string
}

interface RecentAnalysesProps {
  analyses: Analysis[]
  limit?: number
}

const getStatusIcon = (status: Analysis['status']) => {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'running':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    case 'queued':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />
  }
}

const getStatusColor = (status: Analysis['status']) => {
  switch (status) {
    case 'done':
      return 'bg-green-500/10 text-green-500'
    case 'running':
      return 'bg-blue-500/10 text-blue-500'
    case 'queued':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'error':
      return 'bg-red-500/10 text-red-500'
  }
}

export default function RecentAnalyses({ analyses, limit = 5 }: RecentAnalysesProps) {
  const displayedAnalyses = analyses.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Analyses</CardTitle>
          <Link href="/analyses">
            <Button variant="ghost" size="sm" className="text-teal">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedAnalyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/slides/${analysis.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50 hover:bg-charcoal transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  analysis.status === 'done' && 'bg-green-500',
                  analysis.status === 'running' && 'bg-blue-500 animate-pulse',
                  analysis.status === 'queued' && 'bg-yellow-500',
                  analysis.status === 'error' && 'bg-red-500'
                )} />
                <div>
                  <p className="font-medium text-sm group-hover:text-teal transition-colors">
                    {analysis.slide}
                  </p>
                  <p className="text-xs text-cream/40">{analysis.task}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {analysis.confidence && (
                  <span className="text-sm text-teal font-mono">
                    {analysis.confidence}%
                  </span>
                )}
                <span className={cn(
                  'text-xs px-2 py-1 rounded capitalize',
                  getStatusColor(analysis.status)
                )}>
                  {analysis.status}
                </span>
              </div>
            </Link>
          ))}

          {displayedAnalyses.length === 0 && (
            <div className="text-center py-8 text-cream/40">
              No analyses yet. Upload a slide to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}