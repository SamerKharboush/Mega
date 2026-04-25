'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
} from 'lucide-react'

// Mock data
const mockAnalyses = [
  { id: '1', slide: 'lung_adeno_001.svs', task: 'subtype', status: 'done', confidence: 96, duration: 45000, created: '2024-03-18 14:30' },
  { id: '2', slide: 'breast_her2_002.ndpi', task: 'ihc', status: 'running', confidence: null, duration: null, created: '2024-03-18 14:15' },
  { id: '3', slide: 'colon_msi_003.svs', task: 'mutation', status: 'done', confidence: 89, duration: 52000, created: '2024-03-18 13:45' },
  { id: '4', slide: 'lung_scc_004.tiff', task: 'subtype', status: 'queued', confidence: null, duration: null, created: '2024-03-18 13:00' },
  { id: '5', slide: 'melanoma_005.svs', task: 'prognosis', status: 'error', confidence: null, duration: null, created: '2024-03-18 12:30' },
  { id: '6', slide: 'prostate_gleason_006.mrxs', task: 'subtype', status: 'done', confidence: 92, duration: 38000, created: '2024-03-17 16:20' },
]

const taskLabels: Record<string, string> = {
  subtype: 'Cancer Subtyping',
  mutation: 'Mutation Prediction',
  prognosis: 'Survival Prognosis',
  ihc: 'IHC Quantification',
  tme: 'Tumor Microenvironment',
}

export default function AnalysesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [taskFilter, setTaskFilter] = useState('all')

  const filteredAnalyses = mockAnalyses.filter(analysis => {
    const matchesSearch = analysis.slide.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter
    const matchesTask = taskFilter === 'all' || analysis.task === taskFilter
    return matchesSearch && matchesStatus && matchesTask
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'queued': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
        <p className="text-amber-400 text-sm font-medium">
          DEMO MODE — This page displays sample data. Connect your backend to see real results.
        </p>
      </div>

      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl">Analyses</h2>
        <p className="text-cream/60 mt-1">View and manage your AI analysis jobs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <Input
            placeholder="Search by slide name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={taskFilter} onValueChange={setTaskFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Task Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="subtype">Cancer Subtyping</SelectItem>
            <SelectItem value="mutation">Mutation Prediction</SelectItem>
            <SelectItem value="prognosis">Survival Prognosis</SelectItem>
            <SelectItem value="ihc">IHC Quantification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-cream/60">Slide</th>
                <th className="text-left p-4 text-sm font-medium text-cream/60">Task</th>
                <th className="text-left p-4 text-sm font-medium text-cream/60">Status</th>
                <th className="text-left p-4 text-sm font-medium text-cream/60">Confidence</th>
                <th className="text-left p-4 text-sm font-medium text-cream/60">Duration</th>
                <th className="text-left p-4 text-sm font-medium text-cream/60">Created</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAnalyses.map((analysis) => (
                <tr key={analysis.id} className="border-b border-border hover:bg-charcoal-50 transition-colors">
                  <td className="p-4">
                    <Link href={`/slides/${analysis.id}`} className="font-medium hover:text-teal transition-colors">
                      {analysis.slide}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">{taskLabels[analysis.task]}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      <span className="capitalize text-sm">{analysis.status}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    {analysis.confidence ? (
                      <span className="text-teal font-mono">{analysis.confidence}%</span>
                    ) : (
                      <span className="text-cream/40">—</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-cream/60">
                    {analysis.duration ? formatDuration(analysis.duration) : '—'}
                  </td>
                  <td className="p-4 text-sm text-cream/60">{analysis.created}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/slides/${analysis.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      {analysis.status === 'done' && (
                        <Button variant="ghost" size="icon">
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Empty state */}
      {filteredAnalyses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="w-12 h-12 mx-auto text-cream/20 mb-4" />
            <h3 className="font-medium text-lg mb-2">No analyses found</h3>
            <p className="text-cream/60">Try adjusting your filters or run a new analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}