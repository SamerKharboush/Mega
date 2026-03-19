'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface MutationPredictionsProps {
  scores: Record<string, number>
  thresholds?: Record<string, number>
  onGeneClick?: (gene: string) => void
}

const geneDescriptions: Record<string, string> = {
  EGFR: 'Epidermal Growth Factor Receptor',
  KRAS: 'Kirsten Rat Sarcoma Viral Oncogene',
  TP53: 'Tumor Protein P53',
  ALK: 'Anaplastic Lymphoma Kinase',
  ROS1: 'ROS Proto-Oncogene 1',
  BRAF: 'B-Raf Proto-Oncogene',
  MET: 'MET Proto-Oncogene',
  HER2: 'Human Epidermal Growth Factor Receptor 2',
}

export default function MutationPredictions({
  scores,
  thresholds = { high: 0.7, medium: 0.4 },
  onGeneClick,
}: MutationPredictionsProps) {
  // Sort genes by score descending
  const sortedGenes = Object.entries(scores).sort((a, b) => b[1] - a[1])

  const getScoreColor = (score: number) => {
    if (score >= thresholds.high) return 'text-red-500'
    if (score >= thresholds.medium) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProgressColor = (score: number) => {
    if (score >= thresholds.high) return 'bg-red-500'
    if (score >= thresholds.medium) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-cream/60">Mutation Likelihood</h4>

      <div className="space-y-3">
        {sortedGenes.map(([gene, score]) => (
          <button
            key={gene}
            onClick={() => onGeneClick?.(gene)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-medium group-hover:text-teal transition-colors">
                  {gene}
                </span>
                <span className="text-xs text-cream/40 ml-2">
                  {geneDescriptions[gene] || 'Mutation marker'}
                </span>
              </div>
              <span className={cn('font-mono text-sm', getScoreColor(score))}>
                {Math.round(score * 100)}%
              </span>
            </div>
            <div className="relative h-2 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  getProgressColor(score)
                )}
                style={{ width: `${score * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-cream/40 pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>High (≥{Math.round((thresholds.high || 0.7) * 100)}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Medium (≥{Math.round((thresholds.medium || 0.4) * 100)}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Low</span>
        </div>
      </div>
    </div>
  )
}