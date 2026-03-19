'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react'

// Mock data
const mockReports = [
  { id: '1', slide: 'lung_adeno_001.svs', task: 'subtype', pages: 4, size: '2.4 MB', created: '2024-03-18' },
  { id: '2', slide: 'colon_msi_003.svs', task: 'mutation', pages: 5, size: '3.1 MB', created: '2024-03-18' },
  { id: '3', slide: 'prostate_gleason_006.mrxs', task: 'subtype', pages: 4, size: '2.8 MB', created: '2024-03-17' },
  { id: '4', slide: 'breast_her2_002.ndpi', task: 'ihc', pages: 6, size: '3.5 MB', created: '2024-03-16' },
  { id: '5', slide: 'melanoma_005.svs', task: 'prognosis', pages: 5, size: '2.9 MB', created: '2024-03-15' },
]

const taskLabels: Record<string, string> = {
  subtype: 'Cancer Subtyping',
  mutation: 'Mutation Prediction',
  prognosis: 'Survival Prognosis',
  ihc: 'IHC Quantification',
  tme: 'Tumor Microenvironment',
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredReports = mockReports.filter(report =>
    report.slide.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Reports</h2>
          <p className="text-cream/60 mt-1">Download PDF reports with predictions, heatmaps, and annotations</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
        <Input
          placeholder="Search reports..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Reports grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="card-hover group">
            <CardContent className="p-6">
              {/* PDF icon placeholder */}
              <div className="aspect-[3/4] bg-charcoal-50 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <FileText className="w-12 h-12 text-cream/20" />
                <div className="absolute bottom-2 right-2 bg-charcoal px-2 py-1 rounded text-xs">
                  PDF
                </div>
              </div>

              <h3 className="font-medium truncate group-hover:text-teal transition-colors">
                {report.slide.replace(/\.[^.]+$/, '')}_report.pdf
              </h3>

              <div className="flex items-center gap-4 mt-2 text-xs text-cream/40">
                <span>{taskLabels[report.task]}</span>
                <span>{report.pages} pages</span>
                <span>{report.size}</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-cream/40">
                <Calendar className="w-3 h-3" />
                {report.created}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" className="flex-1 bg-teal text-charcoal hover:bg-teal-600">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-cream/20 mb-4" />
            <h3 className="font-medium text-lg mb-2">No reports found</h3>
            <p className="text-cream/60">Run analyses to generate PDF reports</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}