'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { Download, Eye, FileText, X } from 'lucide-react'
import { withBasePath } from '@/lib/base-path'

type Application = {
  _id: string
  jobId?: string | null
  jobTitleSnapshot: string
  name: string
  email: string
  phone: string
  coverLetter?: string
  cvOriginalName: string
  locale: string
  status: string
  createdAt: string
}

type StatusFilter = 'all' | 'new' | 'read' | 'archived'

function statusPill(status: string) {
  if (status === 'new') {
    return 'bg-orange-50 text-[#c45f12] ring-1 ring-orange-200'
  }
  if (status === 'read') {
    return 'bg-[color:var(--brand-indigo)]/10 text-navy ring-1 ring-[color:var(--brand-indigo)]/20'
  }
  return 'bg-muted text-muted-foreground ring-1 ring-border'
}

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy'
}

export default function AdminApplicationsPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [items, setItems] = useState<Application[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<Application | null>(null)

  const statusLabel = (status: string) => {
    if (status === 'new') return t('applications.filterNew')
    if (status === 'read') return t('applications.filterRead')
    if (status === 'archived') return t('applications.filterArchived')
    return status
  }

  const load = async () => {
    const res = await fetch(withBasePath('/api/admin/proxy/job-applications'))
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (!res.ok) return
    const data = (await res.json()) as Application[]
    setItems(data)
    setSelected((prev) => {
      if (!prev) return null
      return data.find((i) => i._id === prev._id) || null
    })
  }

  useEffect(() => {
    load()
  }, [router])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const counts = useMemo(() => {
    return {
      all: items.length,
      new: items.filter((i) => i.status === 'new').length,
      read: items.filter((i) => i.status === 'read').length,
      archived: items.filter((i) => i.status === 'archived').length,
    }
  }, [items])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.status === filter)
  }, [items, filter])

  const setStatus = async (id: string, status: string) => {
    await fetch(withBasePath(`/api/admin/proxy/job-applications/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
  }

  const openItem = async (item: Application) => {
    setSelected(item)
    if (item.status === 'new') {
      await setStatus(item._id, 'read')
    }
  }

  const downloadCv = (id: string, filename: string) => {
    const a = document.createElement('a')
    a.href = `/api/admin/proxy/job-applications/${id}/cv`
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const closeModal = () => setSelected(null)

  const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: t('applications.filterAll') },
    { id: 'new', label: t('applications.filterNew') },
    { id: 'read', label: t('applications.filterRead') },
    { id: 'archived', label: t('applications.filterArchived') },
  ]

  return (
    <AdminShell
      title={t('applications.title')}
      description={t('applications.description')}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-white text-navy hover:border-primary hover:text-primary'
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  active ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                }`}
              >
                {counts[f.id]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-start text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('common.date')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.name')}</th>
                <th className="px-4 py-3 font-semibold">{t('applications.position')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.email')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.phone')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.status')}</th>
                <th className="px-4 py-3 text-end font-semibold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    {filter === 'all'
                      ? t('applications.emptyAll')
                      : t('applications.emptyFilter', { status: statusLabel(filter) })}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="border-t border-border align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{item.name}</td>
                    <td className="max-w-[200px] px-4 py-3 text-muted-foreground">
                      {item.jobTitleSnapshot || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${item.email}`}
                        className="text-navy underline-offset-2 hover:text-primary hover:underline"
                      >
                        {item.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {item.phone}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusPill(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openItem(item)}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" /> {t('common.view')}
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadCv(item._id, item.cvOriginalName)}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" /> {t('applications.downloadCv')}
                        </button>
                        {item.status !== 'archived' ? (
                          <button
                            type="button"
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary"
                            onClick={() => setStatus(item._id, 'archived')}
                          >
                            {t('applications.archive')}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-modal-title"
          onClick={closeModal}
        >
          <div
            className="admin-theme max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-primary">
                  {t('applications.modalEyebrow')}
                </p>
                <h2 id="application-modal-title" className="mt-1 text-xl font-extrabold text-navy">
                  {t('applications.modalTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-border p-2 text-navy hover:border-primary hover:text-primary"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {t('common.name')}
                <input className={fieldClass()} readOnly value={selected.name} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {t('applications.position')}
                <input
                  className={fieldClass()}
                  readOnly
                  value={selected.jobTitleSnapshot || '—'}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {t('common.email')}
                <input className={fieldClass()} readOnly value={selected.email} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {t('common.phone')}
                <input className={fieldClass()} readOnly value={selected.phone} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {t('common.locale')}
                <input className={fieldClass()} readOnly value={selected.locale.toUpperCase()} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
                {t('common.status')}
                <div className="flex h-[42px] items-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusPill(selected.status)}`}
                  >
                    {statusLabel(selected.status)}
                  </span>
                </div>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy sm:col-span-2">
                {t('common.date')}
                <input
                  className={fieldClass()}
                  readOnly
                  value={new Date(selected.createdAt).toLocaleString()}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy sm:col-span-2">
                {t('applications.coverLetter')}
                <textarea
                  className={`${fieldClass()} min-h-[100px] resize-none`}
                  readOnly
                  value={selected.coverLetter || '—'}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy sm:col-span-2">
                {t('applications.cvFile')}
                <div className="flex flex-wrap items-center gap-2">
                  <input className={fieldClass()} readOnly value={selected.cvOriginalName} />
                  <button
                    type="button"
                    onClick={() => downloadCv(selected._id, selected.cvOriginalName)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <Download className="h-4 w-4" /> {t('applications.downloadCv')}
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
              {selected.status !== 'archived' ? (
                <button
                  type="button"
                  onClick={async () => {
                    await setStatus(selected._id, 'archived')
                    closeModal()
                  }}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
                >
                  {t('applications.archive')}
                </button>
              ) : null}
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}
