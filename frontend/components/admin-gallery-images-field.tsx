'use client'

import { Upload, X } from 'lucide-react'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { AdminImagePicker } from '@/components/admin-image-picker'
import { AdminMediaPreview } from '@/components/admin-media-preview'

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:bg-white'
}

function parseGalleryLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function AdminGalleryImagesField({
  value,
  onChange,
  disabled,
  uploading,
  onUploadingChange,
  onError,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  uploading?: boolean
  onUploadingChange?: (uploading: boolean) => void
  onError?: (message: string | null) => void
}) {
  const { t } = useAdminLocale()
  const urls = parseGalleryLines(value)

  const setUrls = (next: string[]) => onChange(next.join('\n'))

  const appendUrl = (url: string) => {
    if (urls.includes(url)) return
    setUrls([...urls, url])
  }

  const removeUrl = (url: string) => setUrls(urls.filter((item) => item !== url))

  return (
    <div className="space-y-3">
      <AdminImagePicker
        disabled={disabled || uploading}
        onUploadingChange={onUploadingChange}
        onError={(message) => onError?.(message)}
        onUploaded={(url) => {
          onError?.(null)
          appendUrl(url)
        }}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload className="h-4 w-4 text-primary" />
        {uploading ? t('common.uploading') : t('pageForm.uploadGalleryImage')}
      </AdminImagePicker>

      <textarea
        className={`${fieldClass()} min-h-[100px] resize-y font-mono text-xs`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('pageForm.galleryImagesPlaceholder')}
      />
      <p className="text-xs text-muted-foreground">{t('pageForm.galleryImagesHint')}</p>

      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {urls.map((url) => (
            <div key={url} className="group relative space-y-1">
              <AdminMediaPreview src={url} className="aspect-[16/10] w-full" />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white/95 text-navy shadow-sm transition hover:border-red-300 hover:text-red-600"
                aria-label={t('pageForm.removeGalleryImage')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="truncate font-mono text-[10px] text-muted-foreground" title={url}>
                {url}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
