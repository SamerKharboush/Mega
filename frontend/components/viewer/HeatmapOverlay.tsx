'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface HeatmapOverlayProps {
  width: number
  height: number
  data?: number[][] // 2D array of attention values (0-1)
  opacity?: number
  colormap?: 'jet' | 'hot' | 'viridis' | 'custom'
}

// Color interpolation helpers
function interpolateColor(
  value: number,
  colormap: string
): [number, number, number, number] {
  value = Math.max(0, Math.min(1, value))

  switch (colormap) {
    case 'jet':
      if (value < 0.25) {
        return [0, 0, Math.round(255 * (value * 4)), 255]
      } else if (value < 0.5) {
        return [0, Math.round(255 * ((value - 0.25) * 4)), 255, 255]
      } else if (value < 0.75) {
        return [Math.round(255 * ((value - 0.5) * 4)), 255, Math.round(255 * (1 - (value - 0.5) * 4)), 255]
      } else {
        return [255, Math.round(255 * (1 - (value - 0.75) * 4)), 0, 255]
      }

    case 'hot':
      if (value < 0.33) {
        return [Math.round(255 * (value * 3)), 0, 0, 255]
      } else if (value < 0.67) {
        return [255, Math.round(255 * ((value - 0.33) * 3)), 0, 255]
      } else {
        return [255, 255, Math.round(255 * ((value - 0.67) * 3)), 255]
      }

    case 'viridis':
      // Simplified viridis approximation
      if (value < 0.5) {
        return [
          Math.round(68 + value * 2 * 50),
          Math.round(1 + value * 2 * 100),
          Math.round(84 + value * 2 * 100),
          255
        ]
      } else {
        return [
          Math.round(118 + (value - 0.5) * 2 * 115),
          Math.round(101 + (value - 0.5) * 2 * 153),
          Math.round(184 - (value - 0.5) * 2 * 100),
          255
        ]
      }

    default:
      // Custom teal-based colormap
      if (value < 0.5) {
        return [
          Math.round(20 + value * 2 * 20),
          Math.round(60 + value * 2 * 124),
          Math.round(100 + value * 2 * 66),
          Math.round(100 + value * 155)
        ]
      } else {
        return [
          Math.round(40 + (value - 0.5) * 2 * 215),
          Math.round(184 + (value - 0.5) * 2 * 71),
          Math.round(166 - (value - 0.5) * 2 * 120),
          255
        ]
      }
  }
}

export default function HeatmapOverlay({
  width,
  height,
  data,
  opacity = 0.6,
  colormap = 'jet',
}: HeatmapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // If no data, render placeholder gradient
    if (!data) {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, 'rgba(0, 0, 255, 0)')
      gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.3)')
      gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.5)')
      gradient.addColorStop(0.7, 'rgba(255, 255, 0, 0.7)')
      gradient.addColorStop(1, 'rgba(255, 0, 0, 1)')
      ctx.fillStyle = gradient
      ctx.globalAlpha = opacity
      ctx.fillRect(0, 0, width, height)
      return
    }

    // Render actual heatmap data
    const imageData = ctx.createImageData(width, height)
    const rows = data.length
    const cols = data[0]?.length || 0

    if (rows === 0 || cols === 0) return

    const tileWidth = width / cols
    const tileHeight = height / rows

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dataY = Math.floor(y / tileHeight)
        const dataX = Math.floor(x / tileWidth)

        if (dataY < rows && dataX < cols) {
          const value = data[dataY][dataX]
          const [r, g, b, a] = interpolateColor(value, colormap)

          const pixelIndex = (y * width + x) * 4
          imageData.data[pixelIndex] = r
          imageData.data[pixelIndex + 1] = g
          imageData.data[pixelIndex + 2] = b
          imageData.data[pixelIndex + 3] = Math.round(a * opacity)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [width, height, data, opacity, colormap])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 pointer-events-none',
        'mix-blend-multiply'
      )}
      style={{ opacity }}
    />
  )
}