'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SurvivalCurveProps {
  data: {
    months: number[]
    survivalProbability: number[]
    lowerCI?: number[]
    upperCI?: number[]
  }
  type: 'OS' | 'PFS'
  predictedMonths?: number
  medianSurvival?: number
}

export default function SurvivalCurve({
  data,
  type,
  predictedMonths,
  medianSurvival,
}: SurvivalCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw axes
    ctx.strokeStyle = 'rgba(250, 250, 249, 0.2)'
    ctx.lineWidth = 1

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, height - padding.bottom)
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.stroke()

    // Grid lines
    ctx.strokeStyle = 'rgba(250, 250, 249, 0.05)'
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (plotHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // Axis labels
    ctx.fillStyle = 'rgba(250, 250, 249, 0.6)'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'

    // X-axis labels (months)
    const maxMonths = Math.max(...data.months)
    for (let i = 0; i <= maxMonths; i += 12) {
      const x = padding.left + (i / maxMonths) * plotWidth
      ctx.fillText(`${i}m`, x, height - padding.bottom + 15)
    }

    // Y-axis labels (probability)
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const prob = 1 - i * 0.25
      const y = padding.top + (plotHeight / 4) * i
      ctx.fillText(`${Math.round(prob * 100)}%`, padding.left - 8, y + 4)
    }

    // Draw confidence interval if available
    if (data.lowerCI && data.upperCI) {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.1)'
      ctx.beginPath()
      for (let i = 0; i < data.months.length; i++) {
        const x = padding.left + (data.months[i] / maxMonths) * plotWidth
        const y = padding.top + (1 - data.upperCI[i]) * plotHeight
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      for (let i = data.months.length - 1; i >= 0; i--) {
        const x = padding.left + (data.months[i] / maxMonths) * plotWidth
        const y = padding.top + (1 - data.lowerCI[i]) * plotHeight
        ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
    }

    // Draw survival curve
    ctx.strokeStyle = '#14B8A6'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < data.months.length; i++) {
      const x = padding.left + (data.months[i] / maxMonths) * plotWidth
      const y = padding.top + (1 - data.survivalProbability[i]) * plotHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw median survival line if available
    if (medianSurvival) {
      ctx.strokeStyle = 'rgba(250, 250, 249, 0.3)'
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      const x = padding.left + (medianSurvival / maxMonths) * plotWidth
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(250, 250, 249, 0.6)'
      ctx.textAlign = 'center'
      ctx.fillText(`Median: ${medianSurvival}m`, x, padding.top - 5)
    }

    // Draw predicted point if available
    if (predictedMonths) {
      const predProb = data.survivalProbability[Math.min(
        data.months.findIndex(m => m >= predictedMonths),
        data.survivalProbability.length - 1
      )] || 0.5

      const x = padding.left + (predictedMonths / maxMonths) * plotWidth
      const y = padding.top + (1 - predProb) * plotHeight

      // Draw marker
      ctx.fillStyle = '#14B8A6'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      // Draw prediction label
      ctx.fillStyle = '#14B8A6'
      ctx.textAlign = 'left'
      ctx.fillText(`Predicted: ${predictedMonths}m`, x + 10, y - 5)
    }
  }, [data, type, predictedMonths, medianSurvival])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {type === 'OS' ? 'Overall Survival' : 'Progression-Free Survival'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="w-full h-48"
        />
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-teal" />
            <span className="text-cream/60">Kaplan-Meier estimate</span>
          </div>
          {medianSurvival && (
            <div className="text-cream/60">
              Median: <span className="text-teal font-mono">{medianSurvival} months</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}