'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { Pencil, Trash2 } from 'lucide-react'

type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'
type JobStatus = 'open' | 'closed'

type Job = {
  _id: string
  slug: string
  titleEn: string
  titleAr: string
  departmentEn: string
  departmentAr: string
  locationEn: string
  locationAr: string
  employmentType: EmploymentType
  descriptionEn: string
  descriptionAr: string
  status: JobStatus
  order: number
}

type FormState = {
  slug: string
  titleEn: string
  titleAr: string
  departmentEn: string
  departmentAr: string
  locationEn: string
  locationAr: string
  employmentType: EmploymentType
  descriptionEn: string
  descriptionAr: string
  status: JobStatus
  order: number
}

const emptyForm: FormState = {
  slug: '',
  titleEn: '',
  titleAr: '',
  departmentEn: '',
  departmentAr: '',
  locationEn: '',
  locationAr: '',
  employmentType: 'full-time',
  descriptionEn: '',
  descriptionAr: '',
  status: 'open',
  order: 0,
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

export default function AdminJobsPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [jobs, setJobs] = useState<Job[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/proxy/jobs/admin/all')
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (!res.ok) return
    const data = (await res.json()) as Job[]
    setJobs(data)
  }

  useEffect(() => {
    load()
  }, [router])

  const nextOrder = useMemo(
    () => (jobs.length ? Math.max(...jobs.map((j) => j.order)) + 1 : 0),
    [jobs],
  )

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus(null)
  }

  const onTitleEnChange = (titleEn: string) => {
    setForm((prev) => ({
      ...prev,
      titleEn,
      slug: slugTouched ? prev.slug : slugify(titleEn),
    }))
    setStatus(null)
  }

  const resetForm = () => {
    setForm({ ...emptyForm, order: nextOrder })
    setEditingId(null)
    setSlugTouched(false)
    setStatus(null)
  }

  const startEdit = (job: Job) => {
    setEditingId(job._id)
    setSlugTouched(true)
    setForm({
      slug: job.slug,
      titleEn: job.titleEn,
      titleAr: job.titleAr,
      departmentEn: job.departmentEn || '',
      departmentAr: job.departmentAr || '',
      locationEn: job.locationEn || '',
      locationAr: job.locationAr || '',
      employmentType: job.employmentType,
      descriptionEn: job.descriptionEn || '',
      descriptionAr: job.descriptionAr || '',
      status: job.status,
      order: job.order,
    })
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titleEn.trim() || !form.titleAr.trim() || !form.slug.trim()) {
      setStatus(t('jobs.requiredFields'))
      return
    }
    setPending(true)
    setStatus(null)
    const payload = {
      ...form,
      titleEn: form.titleEn.trim(),
      titleAr: form.titleAr.trim(),
      slug: form.slug.trim(),
      order: Number(form.order) || 0,
    }
    const res = await fetch(
      editingId ? `/api/admin/proxy/jobs/${editingId}` : '/api/admin/proxy/jobs',
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

  const toggleStatus = async (job: Job) => {
    await fetch(`/api/admin/proxy/jobs/${job._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: job.status === 'open' ? 'closed' : 'open' }),
    })
    await load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('jobs.deleteConfirm'))) return
    await fetch(`/api/admin/proxy/jobs/${id}`, { method: 'DELETE' })
    if (editingId === id) resetForm()
    await load()
  }

  useEffect(() => {
    if (!editingId) {
      setForm((prev) => ({ ...prev, order: nextOrder }))
    }
  }, [nextOrder, editingId])

  const typeLabel = (type: EmploymentType) => {
    if (type === 'part-time') return t('jobs.typePartTime')
    if (type === 'contract') return t('jobs.typeContract')
    if (type === 'internship') return t('jobs.typeInternship')
    return t('jobs.typeFullTime')
  }

  return (
    <AdminShell title={t('jobs.title')} description={t('jobs.description')}>
      <form
        onSubmit={save}
        className="mb-6 grid gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.titleEn')}
          <input
            className={fieldClass()}
            value={form.titleEn}
            onChange={(e) => onTitleEnChange(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.titleAr')}
          <input
            className={fieldClass()}
            value={form.titleAr}
            onChange={(e) => setField('titleAr', e.target.value)}
            required
            dir="rtl"
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
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.departmentEn')}
          <input
            className={fieldClass()}
            value={form.departmentEn}
            onChange={(e) => setField('departmentEn', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.departmentAr')}
          <input
            className={fieldClass()}
            value={form.departmentAr}
            onChange={(e) => setField('departmentAr', e.target.value)}
            dir="rtl"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.locationEn')}
          <input
            className={fieldClass()}
            value={form.locationEn}
            onChange={(e) => setField('locationEn', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.locationAr')}
          <input
            className={fieldClass()}
            value={form.locationAr}
            onChange={(e) => setField('locationAr', e.target.value)}
            dir="rtl"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('jobs.employmentType')}
          <select
            className={fieldClass()}
            value={form.employmentType}
            onChange={(e) => setField('employmentType', e.target.value as EmploymentType)}
          >
            <option value="full-time">{t('jobs.typeFullTime')}</option>
            <option value="part-time">{t('jobs.typePartTime')}</option>
            <option value="contract">{t('jobs.typeContract')}</option>
            <option value="internship">{t('jobs.typeInternship')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          {t('common.status')}
          <select
            className={fieldClass()}
            value={form.status}
            onChange={(e) => setField('status', e.target.value as JobStatus)}
          >
            <option value="open">{t('jobs.statusOpen')}</option>
            <option value="closed">{t('jobs.statusClosed')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy sm:col-span-2">
          {t('jobs.descriptionEn')}
          <textarea
            className={`${fieldClass()} min-h-[100px] resize-y`}
            value={form.descriptionEn}
            onChange={(e) => setField('descriptionEn', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy sm:col-span-2">
          {t('jobs.descriptionAr')}
          <textarea
            className={`${fieldClass()} min-h-[100px] resize-y`}
            value={form.descriptionAr}
            onChange={(e) => setField('descriptionAr', e.target.value)}
            dir="rtl"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending
              ? t('common.saving')
              : editingId
                ? t('jobs.updateJob')
                : t('jobs.addJob')}
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
          <table className="w-full min-w-[800px] text-start text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('common.title')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.slug')}</th>
                <th className="px-4 py-3 font-semibold">{t('jobs.employmentType')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.order')}</th>
                <th className="px-4 py-3 font-semibold">{t('common.status')}</th>
                <th className="px-4 py-3 text-end font-semibold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t('jobs.empty')}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{job.titleEn}</div>
                      <div className="text-xs text-muted-foreground" dir="rtl">
                        {job.titleAr}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{job.slug}</td>
                    <td className="px-4 py-3">{typeLabel(job.employmentType)}</td>
                    <td className="px-4 py-3">{job.order}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          job.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        onClick={() => toggleStatus(job)}
                      >
                        {job.status === 'open' ? t('jobs.statusOpen') : t('jobs.statusClosed')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(job)}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(job._id)}
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
