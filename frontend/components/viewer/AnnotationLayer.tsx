'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Annotation {
  id: string
  type: 'point' | 'rectangle' | 'polygon' | 'freehand'
  coordinates: number[]
  label?: string
  color?: string
}

interface AnnotationLayerProps {
  annotations: Annotation[]
  selectedId?: string
  onSelect?: (id: string) => void
  onCreate?: (annotation: Annotation) => void
  editable?: boolean
  zoom?: number
}

export default function AnnotationLayer({
  annotations,
  selectedId,
  onSelect,
  onCreate,
  editable = false,
  zoom = 1,
}: AnnotationLayerProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'point' | 'rectangle' | 'freehand'>('point')
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (currentTool === 'point') {
      onCreate?.({
        id: crypto.randomUUID(),
        type: 'point',
        coordinates: [x, y],
        label: 'ROI',
        color: '#14B8A6',
      })
    } else if (currentTool === 'rectangle' && !isDrawing) {
      setIsDrawing(true)
      setStartPoint({ x, y })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !isDrawing || !startPoint) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    if (currentTool === 'rectangle') {
      onCreate?.({
        id: crypto.randomUUID(),
        type: 'rectangle',
        coordinates: [startPoint.x, startPoint.y, x, y],
        label: 'ROI',
        color: '#14B8A6',
      })
    }

    setIsDrawing(false)
    setStartPoint(null)
  }

  const renderAnnotation = (annotation: Annotation) => {
    const isSelected = annotation.id === selectedId
    const baseClass = cn(
      'absolute transition-all',
      isSelected && 'ring-2 ring-teal ring-offset-2'
    )

    switch (annotation.type) {
      case 'point':
        return (
          <div
            key={annotation.id}
            className={cn(baseClass, 'w-4 h-4 rounded-full -translate-x-2 -translate-y-2 cursor-pointer')}
            style={{
              left: annotation.coordinates[0] * zoom,
              top: annotation.coordinates[1] * zoom,
              backgroundColor: annotation.color || '#14B8A6',
            }}
            onClick={() => onSelect?.(annotation.id)}
          />
        )

      case 'rectangle':
        const [x1, y1, x2, y2] = annotation.coordinates
        const rectWidth = Math.abs(x2 - x1) * zoom
        const rectHeight = Math.abs(y2 - y1) * zoom
        return (
          <div
            key={annotation.id}
            className={cn(baseClass, 'border-2 cursor-pointer')}
            style={{
              left: Math.min(x1, x2) * zoom,
              top: Math.min(y1, y2) * zoom,
              width: rectWidth,
              height: rectHeight,
              borderColor: annotation.color || '#14B8A6',
              backgroundColor: `${annotation.color || '#14B8A6'}20`,
            }}
            onClick={() => onSelect?.(annotation.id)}
          >
            {annotation.label && (
              <span className="absolute -top-6 left-0 text-xs bg-charcoal px-1 rounded whitespace-nowrap">
                {annotation.label}
              </span>
            )}
          </div>
        )

      case 'polygon':
        const points = annotation.coordinates
          .reduce((acc, val, i) => {
            if (i % 2 === 0) {
              acc.push(`${val * zoom},${annotation.coordinates[i + 1] * zoom}`)
            }
            return acc
          }, [] as string[])
          .join(' ')
        return (
          <svg
            key={annotation.id}
            className="absolute inset-0 pointer-events-none"
          >
            <polygon
              points={points}
              fill={`${annotation.color || '#14B8A6'}20`}
              stroke={annotation.color || '#14B8A6'}
              strokeWidth={2}
              className="cursor-pointer pointer-events-auto"
              onClick={() => onSelect?.(annotation.id)}
            />
          </svg>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="absolute inset-0"
      onClick={handleCanvasClick}
      onMouseUp={handleMouseUp}
    >
      {annotations.map(renderAnnotation)}

      {/* Drawing preview */}
      {isDrawing && startPoint && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="text-xs text-teal bg-charcoal px-2 py-1 rounded">
            Release to complete
          </div>
        </div>
      )}
    </div>
  )
}