'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase'
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
}

const ACCEPTED_FORMATS = {
  'image/tiff': ['.tiff', '.tif'],
  'image/vnd.opendx': ['.svs'],
  'image/ndpi': ['.ndpi'],
  'image/mrxs': ['.mrxs'],
  'image/scn': ['.scn'],
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 // 5GB

export default function SlideUploader() {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const uploadFile = async (uploadingFile: UploadingFile) => {
    const { file } = uploadingFile
    const supabase = createClient()

    // Update status to uploading
    setFiles(prev =>
      prev.map(f =>
        f.id === uploadingFile.id
          ? { ...f, status: 'uploading' }
          : f
      )
    )

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate storage path
      const ext = file.name.split('.').pop()?.toLowerCase() || 'tiff'
      const storagePath = `${user.id}/${uploadingFile.id}.${ext}`

      // Upload to Supabase Storage with progress tracking
      // Note: Supabase JS client doesn't support progress events directly
      // In production, you'd use a custom upload with XMLHttpRequest or fetch

      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Simulate progress for demo
      for (let progress = 0; progress <= 100; progress += 10) {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, progress }
              : f
          )
        )
        await new Promise(r => setTimeout(r, 100))
      }

      // Update status to processing
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, status: 'processing' }
            : f
        )
      )

      // Create slide record via API
      const response = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          storage_path: storagePath,
          format: ext,
        }),
      })

      if (!response.ok) throw new Error('Failed to create slide record')

      // Mark as done
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, status: 'done', progress: 100 }
            : f
        )
      )

      toast({
        title: 'Upload complete',
        description: `${file.name} has been uploaded successfully`,
        variant: 'success',
      })
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      )

      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      })
    }
  }

  const uploadAll = async () => {
    setIsUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')

    for (const file of pendingFiles) {
      await uploadFile(file)
    }

    setIsUploading(false)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 text-teal animate-spin" />
      default:
        return <File className="w-5 h-5 text-cream/40" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-teal bg-teal/5'
            : 'border-border hover:border-teal/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn(
          'w-12 h-12 mx-auto mb-4',
          isDragActive ? 'text-teal' : 'text-cream/40'
        )} />
        <p className="font-medium">
          {isDragActive ? 'Drop slides here' : 'Drag & drop whole-slide images'}
        </p>
        <p className="text-sm text-cream/40 mt-2">
          SVS, NDPI, TIFF, MRXS, SCN • Max 5GB per file
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cream/60">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={uploadAll}
                disabled={isUploading || files.every(f => f.status !== 'pending')}
                className="bg-teal text-charcoal hover:bg-teal-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload All'
                )}
              </Button>
            </div>

            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-50"
              >
                {getStatusIcon(file.status)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{file.file.name}</span>
                    <span className="text-sm text-cream/40">
                      {formatBytes(file.file.size)}
                    </span>
                  </div>

                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}

                  {file.status === 'processing' && (
                    <p className="text-xs text-teal mt-1">Processing tiles...</p>
                  )}

                  {file.error && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>

                {file.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}