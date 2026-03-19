'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Microscope,
  Dna,
  Shield,
  Download,
  Loader2,
  Play,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Prediction {
  label: string
  score: number
}

interface AnalysisResults {
  predictions: Prediction[]
  confidence: number
  uncertainty: number
  mutationScores?: Record<string, number>
  survivalPrediction?: {
    osMonths: number
    pfsMonths: number
  }
}

interface AnalysisPanelProps {
  slideId: string
  results?: AnalysisResults
  status: 'idle' | 'queued' | 'running' | 'done' | 'error'
  onRunAnalysis: (task: string) => void
  onDownloadReport: () => void
}

const tasks = [
  { id: 'subtype', name: 'Cancer Subtyping', icon: Microscope, description: 'Identify tumor type' },
  { id: 'mutation', name: 'Mutation Prediction', icon: Dna, description: 'EGFR, KRAS, TP53 scores' },
  { id: 'prognosis', name: 'Survival Prognosis', icon: Shield, description: 'OS and PFS prediction' },
]

export default function AnalysisPanel({
  slideId,
  results,
  status,
  onRunAnalysis,
  onDownloadReport,
}: AnalysisPanelProps) {
  const [selectedTask, setSelectedTask] = React.useState('subtype')

  return (
    <div className="flex flex-col h-full">
      {/* Task selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Run Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedTask} onValueChange={setSelectedTask}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  <div className="flex items-center gap-2">
                    <task.icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-xs text-cream/40">{task.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className={cn(
              'w-full',
              status === 'running'
                ? 'bg-charcoal-100 text-cream/60'
                : 'bg-teal text-charcoal hover:bg-teal-600'
            )}
            onClick={() => onRunAnalysis(selectedTask)}
            disabled={status === 'running' || status === 'queued'}
          >
            {status === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : status === 'queued' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Queued...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>

          {status === 'running' && (
            <div className="space-y-2">
              <Progress value={66} className="h-1" />
              <p className="text-xs text-cream/40 text-center">Processing tiles...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && status === 'done' && (
        <Card className="flex-1 mt-4 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dna className="w-5 h-5 text-teal" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto">
            {/* Predictions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-cream/60">Subtype Predictions</h4>
              {results.predictions.map((pred, i) => (
                <div key={pred.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={i === 0 ? 'text-teal font-medium' : ''}>
                      {pred.label}
                    </span>
                    <span className="font-mono">{pred.score}%</span>
                  </div>
                  <Progress value={pred.score} className="h-2" />
                </div>
              ))}
            </div>

            {/* Confidence */}
            <div className="p-3 rounded-lg bg-charcoal-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream/60">Confidence</span>
                <span className="text-teal font-mono text-lg">{results.confidence}%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {results.confidence >= 80 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : results.confidence >= 60 ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={cn(
                  'text-xs',
                  results.confidence >= 80 ? 'text-green-500' :
                  results.confidence >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                )}>
                  {results.confidence >= 80 ? 'High confidence' :
                   results.confidence >= 60 ? 'Moderate confidence' :
                   'Low confidence - consider manual review'}
                </span>
              </div>
            </div>

            {/* Mutation scores */}
            {results.mutationScores && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-cream/60">Mutation Likelihood</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(results.mutationScores).map(([gene, score]) => (
                    <div key={gene} className="p-2 rounded bg-charcoal-50">
                      <div className="text-xs text-cream/40">{gene}</div>
                      <div className="font-mono text-sm">{Math.round(score * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download */}
            <Button
              variant="outline"
              className="w-full"
              onClick={onDownloadReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {status === 'error' && (
        <Card className="mt-4 border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-500">Analysis Failed</p>
              <p className="text-sm text-cream/60 mt-1">
                An error occurred during analysis. Please try again or contact support.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Retry Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import React from 'react'