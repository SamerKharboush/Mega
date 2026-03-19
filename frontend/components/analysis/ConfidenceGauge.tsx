'use client'

import { cn } from '@/lib/utils'

interface ConfidenceGaugeProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export default function ConfidenceGauge({
  value,
  size = 'md',
  showLabel = true,
  animated = true,
}: ConfidenceGaugeProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value))

  // Calculate stroke properties
  const sizeMap = {
    sm: { width: 80, stroke: 6 },
    md: { width: 120, stroke: 10 },
    lg: { width: 160, stroke: 14 },
  }

  const { width, stroke } = sizeMap[size]
  const radius = (width - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  // Determine color based on value
  const getColor = (val: number) => {
    if (val >= 80) return { stroke: '#22C55E', text: 'text-green-500' }
    if (val >= 60) return { stroke: '#EAB308', text: 'text-yellow-500' }
    return { stroke: '#EF4444', text: 'text-red-500' }
  }

  const color = getColor(clampedValue)

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-charcoal-100"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-all',
            animated && 'duration-1000 ease-out'
          )}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-mono font-bold', color.text, {
          'text-lg': size === 'sm',
          'text-2xl': size === 'md',
          'text-3xl': size === 'lg',
        })}>
          {clampedValue}%
        </span>
      </div>

      {/* Label */}
      {showLabel && (
        <span className="mt-2 text-sm text-cream/60">Confidence</span>
      )}
    </div>
  )
}