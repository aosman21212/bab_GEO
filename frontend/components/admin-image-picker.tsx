'use client'

import { useCallback, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { withBasePath } from '@/lib/base-path'

type Props = {
  onUploaded: (url: string, fileName: string) => void
  onError?: (message: string) => void
  onUploadingChange?: (uploading: boolean) => void
  disabled?: boolean
  accept?: string
  className?: string
  children: React.ReactNode
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = src
  })
}

async function cropToBlob(imageSrc: string, crop: Area, mime = 'image/jpeg'): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(crop.width))
  canvas.height = Math.max(1, Math.round(crop.height))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
      mime,
      0.92,
    )
  })
}

async function uploadFile(file: File | Blob, fileName: string): Promise<string> {
  const body = new FormData()
  body.append('file', file, fileName)
  const res = await fetch(withBasePath('/api/admin/upload'), { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Upload failed')
  }
  return (data as { url: string }).url
}

export function AdminImagePicker({
  onUploaded,
  onError,
  onUploadingChange,
  disabled,
  accept = 'image/*',
  className,
  children,
}: Props) {
  const { t } = useAdminLocale()
  const inputRef = useRef<HTMLInputElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const close = useCallback(() => {
    if (src) URL.revokeObjectURL(src)
    setSrc(null)
    setFile(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [src])

  const runUpload = async (payload: File | Blob, name: string) => {
    setBusy(true)
    onUploadingChange?.(true)
    try {
      const url = await uploadFile(payload, name)
      onUploaded(url, name)
      close()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('common.uploadFailed'))
    } finally {
      setBusy(false)
      onUploadingChange?.(false)
    }
  }

  const onPick = async (picked: File | undefined) => {
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      onError?.(t('partners.imageOnly'))
      return
    }

    // SVG: upload as-is (no crop)
    if (picked.type === 'image/svg+xml') {
      await runUpload(picked, picked.name)
      return
    }

    const objectUrl = URL.createObjectURL(picked)
    setFile(picked)
    setSrc(objectUrl)
  }

  const uploadOriginal = async () => {
    if (!file) return
    await runUpload(file, file.name)
  }

  const uploadCropped = async () => {
    if (!src || !croppedArea || !file) return
    setBusy(true)
    onUploadingChange?.(true)
    try {
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const ext = mime === 'image/png' ? 'png' : 'jpg'
      const base = file.name.replace(/\.[^.]+$/, '') || 'image'
      const blob = await cropToBlob(src, croppedArea, mime)
      const url = await uploadFile(blob, `${base}-cropped.${ext}`)
      onUploaded(url, `${base}-cropped.${ext}`)
      close()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('common.uploadFailed'))
    } finally {
      setBusy(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <>
      <label className={className}>
        {children}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => {
            void onPick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>

      {src && file ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('imagePicker.title')}
            className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-xl"
          >
            <div>
              <h3 className="text-lg font-extrabold text-navy">{t('imagePicker.title')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('imagePicker.hint')}</p>
            </div>

            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-muted">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>

            <label className="flex flex-col gap-1 text-xs font-semibold text-navy">
              {t('imagePicker.cropHint')}
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="accent-[var(--primary)]"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void uploadOriginal()}
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? t('common.uploading') : t('imagePicker.uploadOriginal')}
              </button>
              <button
                type="button"
                disabled={busy || !croppedArea}
                onClick={() => void uploadCropped()}
                className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
              >
                {t('imagePicker.uploadCropped')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={close}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-navy"
              >
                {t('imagePicker.cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
