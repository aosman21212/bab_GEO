'use client'

import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'

export function AdminMediaPreview({
  src,
  className = 'h-28 w-full max-w-[200px]',
  label,
}: {
  src: string
  className?: string
  label?: string
}) {
  const [failed, setFailed] = useState(false)
  const trimmed = src?.trim()

  useEffect(() => {
    setFailed(false)
  }, [trimmed])

  if (!trimmed) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted text-xs text-muted-foreground ${className}`}
      >
        {label || 'No image'}
      </div>
    )
  }

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-border bg-muted p-2 text-center text-[10px] text-muted-foreground ${className}`}
        title={trimmed}
      >
        <ImageOff className="h-5 w-5 shrink-0 opacity-60" />
        <span className="line-clamp-2 break-all">{trimmed}</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trimmed}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export function AdminGalleryPreviews({ urls }: { urls: string[] }) {
  const slides = [...new Set(urls.map((u) => u.trim()).filter(Boolean))]
  if (slides.length === 0) return null

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {slides.map((url) => (
        <div key={url} className="space-y-1">
          <AdminMediaPreview src={url} className="aspect-[16/10] w-full" />
          <p className="truncate font-mono text-[10px] text-muted-foreground" title={url}>
            {url}
          </p>
        </div>
      ))}
    </div>
  )
}
