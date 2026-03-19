'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Layers,
  Download,
  Play,
  Loader2,
  Microscope,
  Dna,
  Shield,
} from 'lucide-react'

// Mock slide data
const mockSlide = {
  id: '1',
  filename: 'lung_adeno_001.svs',
  status: 'ready',
  width: 45000,
  height: 32000,
  format: 'svs',
  tileCount: 1247,
  dziPath: 'https://storage.supabase.co/slides/1/dzi',
  created: '2024-03-18T10:30:00Z',
}

// Mock analysis results
const mockResults = {
  predictions: [
    { label: 'Lung Adenocarcinoma', score: 87 },
    { label: 'Lung Squamous Cell Carcinoma', score: 8 },
    { label: 'Small Cell Lung Cancer', score: 3 },
    { label: 'Large Cell Neuroendocrine', score: 1 },
    { label: 'Pulmonary Carcinoid', score: 1 },
  ],
  confidence: 94,
  uncertainty: 6,
  mutationScores: {
    'EGFR': 0.72,
    'KRAS': 0.15,
    'TP53': 0.89,
    'ALK': 0.08,
    'ROS1': 0.03,
  },
}

const analysisTasks = [
  { id: 'subtype', name: 'Cancer Subtyping', icon: Microscope },
  { id: 'mutation', name: 'Mutation Prediction', icon: Dna },
  { id: 'prognosis', name: 'Survival Prognosis', icon: Shield },
]

export default function SlideDetailPage() {
  const params = useParams()
  const slideId = params.id as string

  const [selectedTask, setSelectedTask] = useState('subtype')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [zoom, setZoom] = useState(1)

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* WSI Viewer */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full">
            {/* Viewer toolbar */}
            <div className="h-12 border-b border-border flex items-center px-4 gap-2">
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z * 1.5, 10))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z / 1.5, 0.1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Move className="w-4 h-4" />
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <Button
                variant={showHeatmap ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Layers className="w-4 h-4" />
              </Button>
              <div className="flex-1" />
              <span className="text-sm text-cream/60">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* OpenSeadragon viewer placeholder */}
            <div className="h-[calc(100%-3rem)] bg-charcoal relative">
              {/* This would be replaced with actual OpenSeadragon instance */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Microscope className="w-16 h-16 mx-auto text-cream/20 mb-4" />
                  <p className="text-cream/40">Whole-Slide Image Viewer</p>
                  <p className="text-sm text-cream/20 mt-1">
                    {mockSlide.width.toLocaleString()} × {mockSlide.height.toLocaleString()} pixels
                  </p>
                </div>
              </div>

              {/* Heatmap overlay indicator */}
              {showHeatmap && (
                <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
                  <span>Attention Heatmap Active</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Panel */}
      <div className="w-96 flex flex-col gap-4">
        {/* Slide info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{mockSlide.filename}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cream/60">Format</span>
              <span className="uppercase">{mockSlide.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/60">Dimensions</span>
              <span>{mockSlide.width.toLocaleString()} × {mockSlide.height.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/60">Tiles</span>
              <span>{mockSlide.tileCount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Run analysis */}
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
                {analysisTasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    <div className="flex items-center gap-2">
                      <task.icon className="w-4 h-4" />
                      {task.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-teal text-charcoal hover:bg-teal-600"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dna className="w-5 h-5 text-teal" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto">
            {/* Predictions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-cream/60">Subtype Predictions</h4>
              {mockResults.predictions.map((pred, i) => (
                <div key={pred.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={i === 0 ? 'text-teal font-medium' : ''}>{pred.label}</span>
                    <span className="font-mono">{pred.score}%</span>
                  </div>
                  <Progress value={pred.score} className="h-2" />
                </div>
              ))}
            </div>

            {/* Confidence */}
            <div className="p-3 rounded-lg bg-charcoal-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream/60">Overall Confidence</span>
                <span className="text-teal font-mono text-lg">{mockResults.confidence}%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500">High confidence prediction</span>
              </div>
            </div>

            {/* Mutation scores */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-cream/60">Mutation Likelihood</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(mockResults.mutationScores).map(([gene, score]) => (
                  <div key={gene} className="p-2 rounded bg-charcoal-50">
                    <div className="text-xs text-cream/40">{gene}</div>
                    <div className="font-mono text-sm">{Math.round(score * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}