'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Home,
  Layers,
  FullScreen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WSIViewerProps {
  dziUrl: string
  width: number
  height: number
  heatmapUrl?: string
  showHeatmap?: boolean
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void
}

export default function WSIViewer({
  dziUrl,
  width,
  height,
  heatmapUrl,
  showHeatmap = false,
  onViewportChange,
}: WSIViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [zoom, setZoom] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    // Initialize OpenSeadragon viewer
    // In production, this would use the actual OpenSeadragon library
    const initViewer = async () => {
      // Dynamic import for client-side only
      // const OpenSeadragon = (await import('openseadragon')).default

      // Mock viewer initialization
      // viewerRef.current = OpenSeadragon({
      //   id: containerRef.current!.id,
      //   prefixUrl: '//openseadragon.github.io/openseadragon/images/',
      //   tileSources: dziUrl,
      //   animationTime: 0.5,
      //   blendTime: 0.1,
      //   constrainDuringPan: true,
      //   maxZoomPixelRatio: 2,
      //   minZoomLevel: 0.5,
      //   visibilityRatio: 1,
      //   zoomPerScroll: 1.2,
      // })

      // viewerRef.current.addHandler('viewport-change', () => {
      //   const viewport = viewerRef.current.viewport
      //   onViewportChange?.({
      //     x: viewport.getCenter().x,
      //     y: viewport.getCenter().y,
      //     zoom: viewport.getZoom(),
      //   })
      //   setZoom(viewport.getZoom())
      // })

      // viewerRef.current.addHandler('open', () => {
      //   setIsLoaded(true)
      // })

      // Simulate loading for demo
      setTimeout(() => setIsLoaded(true), 500)
    }

    initViewer()

    return () => {
      viewerRef.current?.destroy?.()
    }
  }, [dziUrl, onViewportChange])

  const handleZoomIn = () => {
    viewerRef.current?.viewport?.zoomBy(1.2)
  }

  const handleZoomOut = () => {
    viewerRef.current?.viewport?.zoomBy(0.8)
  }

  const handleReset = () => {
    viewerRef.current?.viewport?.goHome()
  }

  const handleRotate = () => {
    const currentRotation = viewerRef.current?.viewport?.getRotation() || 0
    viewerRef.current?.viewport?.setRotation(currentRotation + 90)
  }

  return (
    <div className="relative h-full w-full bg-charcoal">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cream/60">Loading slide tiles...</p>
          </div>
        </div>
      )}

      {/* Viewer container */}
      <div
        ref={containerRef}
        id="openseadragon-viewer"
        className="h-full w-full"
      />

      {/* Placeholder for demo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-cream/20">
          <p className="text-sm">WSI Viewer</p>
          <p className="text-xs mt-1">{width.toLocaleString()} × {height.toLocaleString()} px</p>
        </div>
      </div>

      {/* Controls */}
      <div
        className={cn(
          'absolute bottom-4 left-4 flex items-center gap-2 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="bg-charcoal/90 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRotate} className="h-8 w-8">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Move className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Heatmap toggle indicator */}
      {heatmapUrl && (
        <div className="absolute top-4 left-4 bg-charcoal/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            showHeatmap ? 'bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500' : 'bg-cream/30'
          )} />
          <span className="text-cream/80">
            {showHeatmap ? 'Attention Heatmap' : 'Heatmap Hidden'}
          </span>
        </div>
      )}

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 right-4 bg-charcoal/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-mono">
        {Math.round(zoom * 100)}%
      </div>

      {/* Fullscreen button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 bg-charcoal/90 backdrop-blur-sm"
        onClick={() => {
          if (containerRef.current) {
            containerRef.current.requestFullscreen?.()
          }
        }}
      >
        <FullScreen className="w-4 h-4" />
      </Button>
    </div>
  )
}