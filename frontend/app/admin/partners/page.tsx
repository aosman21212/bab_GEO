'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from '@/components/app-image'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { AdminImagePicker } from '@/components/admin-image-picker'
import { ImagePlus, Pencil, Trash2, Upload } from 'lucide-react'
import { withBasePath } from '@/lib/base-path'

type Partner = {
  _id: string
  slug: string
  name: string
  logoUrl: string
  order: number
  active: boolean
}

type FormState = {
  name: string
  slug: string
  logoUrl: string
  order: number
  active: boolean
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  logoUrl: '',
  order: 0,
  active: true,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:bg-white'
}

export default function AdminPartnersPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [partners, setPartners] = useState<Partner[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const load = async () => {
    const res = await fetch(withBasePath('/api/admin/proxy/partners/admin/all'))
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (!res.ok) return
    const data = (await res.json()) as Partner[]
    setPartners(data)
  }

  useEffect(() => {
    load()
  }, [router])

  const nextOrder = useMemo(
    () => (partners.length ? Math.max(...partners.map((p) => p.order)) + 1 : 0),
    [partners],
  )

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus(null)
  }

  const onNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }))
    setStatus(null)
  }

  const resetForm = () => {
    setForm({ ...emptyForm, order: nextOrder })
    setEditingId(null)
    setSlugTouched(false)
    setUploadError(null)
    setFileName(null)
    setStatus(null)
  }

  const startEdit = (p: Partner) => {
    setEditingId(p._id)
    setSlugTouched(true)
    setForm({
      name: p.name || p.slug,
      slug: p.slug,
      logoUrl: p.logoUrl,
      order: p.order,
      active: p.active,
    })
    setFileName(null)
    setUploadError(null)
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onImageUploaded = (url: string, name: string) => {
    setField('logoUrl', url)
    setFileName(name)
    setUploadError(null)
    setStatus(t('partners.logoUploaded'))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) {
      setStatus(t('partners.nameSlugRequired'))
      return
    }
    if (!form.logoUrl.trim()) {
      setStatus(t('partners.uploadLogoFirst'))
      setUploadError(t('partners.uploadLogoFirst'))
      return
    }
    setPending(true)
    setStatus(null)
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      logoUrl: form.logoUrl.trim(),
      order: Number(form.order) || 0,
      active: form.active,
    }
    const res = await fetch(
      editingId ? withBasePath(`/api/admin/proxy/partners/${editingId}`) : withBasePath('/api/admin/proxy/partners'),
      {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    setPending(false)
    if (!res.ok) {
      setStatus(t('common.saveFailed'))
      return
    }
    setStatus(editingId ? t('common.updated') : t('common.added'))
    resetForm()
    await load()
  }

  const toggle = async (p: Partner) => {
    await fetch(withBasePath(`/api/admin/proxy/partners/${p._id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    })
    await load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('partners.deleteConfirm'))) return
    await fetch(withBasePath(`/api/admin/proxy/partners/${id}`), { method: 'DELETE' })
    if (editingId === id) resetForm()
    await load()
  }

  useEffect(() => {
    if (!editingId) {
      setForm((prev) => ({ ...prev, order: nextOrder }))
    }
  }, [nextOrder, editingId])

  return (
    <AdminShell title={t('partners.title')} description={t('partners.description')}>
      <form
        onSubmit={save}
        className="mb-6 grid gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm lg:grid-cols-[1fr_260px]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
            {t('common.name')}
            <input
              className={fieldClass()}
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t('partners.namePlaceholder')}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
            {t('common.slug')}
            <input
              className={`${fieldClass()} font-mono`}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setField('slug', slugify(e.target.value))
              }}
              placeholder={t('partners.slugPlaceholder')}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
            {t('common.order')}
            <input
              className={fieldClass()}
              type="number"
              value={form.order}
              onChange={(e) => setField('order', Number(e.target.value))}
            />
          </label>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField('active', e.target.checked)}
                className="h-4 w-4 accent-[color:var(--primary)]"
              />
              {t('partners.activeOnHomepage')}
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-navy">{t('partners.logo')}</p>
          <p className="text-xs text-muted-foreground">{t('partners.logoHint')}</p>
          <AdminImagePicker
            disabled={uploading}
            onUploadingChange={setUploading}
            onError={setUploadError}
            onUploaded={onImageUploaded}
            className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
              form.logoUrl
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-muted hover:border-primary hover:bg-primary/5'
            }`}
          >
            {form.logoUrl ? (
              <>
                <Image
                  src={form.logoUrl}
                  alt={form.name || t('partners.logo')}
                  width={160}
                  height={64}
                  className="max-h-16 w-auto object-contain"
                  unoptimized
                />
                <span className="text-xs font-medium text-navy">
                  {fileName || t('partners.logoReady')}
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-primary" />
                <span className="text-sm font-semibold text-navy">
                  {uploading ? t('common.uploading') : t('partners.uploadLogo')}
                </span>
                <span className="text-xs text-muted-foreground">{t('partners.formats')}</span>
              </>
            )}
          </AdminImagePicker>
          {!form.logoUrl ? (
            <AdminImagePicker
              disabled={uploading}
              onUploadingChange={setUploading}
              onError={setUploadError}
              onUploaded={onImageUploaded}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Upload className="h-4 w-4" />
              {uploading ? t('common.uploading') : t('partners.chooseFile')}
            </AdminImagePicker>
          ) : null}
          {uploadError ? <p className="text-xs font-medium text-red-600">{uploadError}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
          {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
          <button
            type="submit"
            disabled={pending || uploading}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending
              ? t('common.saving')
              : editingId
                ? t('partners.updatePartner')
                : t('partners.addPartner')}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-navy"
            >
              {t('common.cancelEdit')}
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('partners.logoCol')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.name')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.slug')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.order')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.active')}</th>
                <th className="px-4 py-3 text-end font-semibold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t('partners.empty')}
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-border bg-muted">
                        <Image
                          src={p.logoUrl}
                          alt={p.name || p.slug}
                          width={56}
                          height={28}
                          className="max-h-7 w-auto object-contain"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{p.name || p.slug}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                    <td className="px-4 py-3">{p.order}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        onClick={() => toggle(p)}
                      >
                        {p.active ? t('common.active') : t('common.hidden')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p._id)}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
