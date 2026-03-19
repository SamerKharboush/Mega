'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Upload,
  Grid3X3,
  List,
  MoreVertical,
  Eye,
  Activity,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// Mock data
const mockSlides = [
  { id: '1', filename: 'lung_adeno_001.svs', status: 'ready', width: 45000, height: 32000, analyses: 3, created: '2024-03-18' },
  { id: '2', filename: 'breast_her2_002.ndpi', status: 'processing', width: 52000, height: 41000, analyses: 1, created: '2024-03-17' },
  { id: '3', filename: 'colon_msi_003.svs', status: 'ready', width: 38000, height: 29000, analyses: 5, created: '2024-03-16' },
  { id: '4', filename: 'lung_scc_004.tiff', status: 'uploaded', width: 41000, height: 35000, analyses: 0, created: '2024-03-15' },
  { id: '5', filename: 'melanoma_005.svs', status: 'error', width: 33000, height: 28000, analyses: 0, created: '2024-03-14' },
  { id: '6', filename: 'prostate_gleason_006.mrxs', status: 'ready', width: 55000, height: 48000, analyses: 2, created: '2024-03-13' },
]

export default function SlidesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSlides = mockSlides.filter(slide =>
    slide.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'processing': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'uploaded': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Slide Library</h2>
          <p className="text-cream/60 mt-1">{mockSlides.length} slides uploaded</p>
        </div>
        <Button className="bg-teal text-charcoal hover:bg-teal-600">
          <Upload className="w-4 h-4 mr-2" />
          Upload Slide
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <Input
            placeholder="Search slides..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSlides.map((slide) => (
            <Card key={slide.id} className="card-hover group">
              <Link href={`/slides/${slide.id}`}>
                <CardContent className="p-0">
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video bg-charcoal-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-cream/20 text-sm">WSI Preview</div>
                    <div className="absolute top-2 right-2">
                      {getStatusIcon(slide.status)}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium truncate group-hover:text-teal transition-colors">
                      {slide.filename}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-cream/40">
                      <span>{(slide.width / 1000).toFixed(0)}K × {(slide.height / 1000).toFixed(0)}K</span>
                      <span>{slide.analyses} analyses</span>
                    </div>
                    <p className="text-xs text-cream/40 mt-1">{slide.created}</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-cream/60">Filename</th>
                  <th className="text-left p-4 text-sm font-medium text-cream/60">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-cream/60">Dimensions</th>
                  <th className="text-left p-4 text-sm font-medium text-cream/60">Analyses</th>
                  <th className="text-left p-4 text-sm font-medium text-cream/60">Uploaded</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSlides.map((slide) => (
                  <tr key={slide.id} className="border-b border-border hover:bg-charcoal-50 transition-colors">
                    <td className="p-4">
                      <Link href={`/slides/${slide.id}`} className="font-medium hover:text-teal transition-colors">
                        {slide.filename}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(slide.status)}
                        <span className="capitalize text-sm">{slide.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-sm text-cream/60">
                      {slide.width.toLocaleString()} × {slide.height.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm">{slide.analyses}</td>
                    <td className="p-4 text-sm text-cream/60">{slide.created}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/slides/${slide.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Activity className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {filteredSlides.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="w-12 h-12 mx-auto text-cream/20 mb-4" />
            <h3 className="font-medium text-lg mb-2">No slides found</h3>
            <p className="text-cream/60 mb-4">
              {searchQuery ? 'Try a different search term' : 'Upload your first whole-slide image to get started'}
            </p>
            <Button className="bg-teal text-charcoal hover:bg-teal-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload Slide
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}