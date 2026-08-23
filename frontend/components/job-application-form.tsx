'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { submitJobApplication, type ApiJob } from '@/lib/api'

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-navy outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
}

export function JobApplicationForm({
  jobs,
  selectedJobId,
  onJobChange,
}: {
  jobs: ApiJob[]
  selectedJobId: string | null
  onJobChange: (jobId: string | null) => void
}) {
  const t = useTranslations('careersPage')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('locale', locale === 'ar' ? 'ar' : 'en')
    if (selectedJobId) {
      fd.set('jobId', selectedJobId)
    } else {
      fd.delete('jobId')
    }

    const file = fd.get('cv')
    if (!(file instanceof File) || file.size === 0) {
      setPending(false)
      setError(t('cvRequired'))
      return
    }

    const result = await submitJobApplication(fd)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent(true)
    form.reset()
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <p className="text-[11px] font-bold tracking-[0.14em] text-primary">BAB</p>
        <h2 className="mt-2 text-xl font-extrabold text-navy">{t('thanksTitle')}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t('thanksBody')}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
      encType="multipart/form-data"
    >
      <p className="text-[11px] font-bold tracking-[0.14em] text-primary">{t('formEyebrow')}</p>
      <h2 className="mt-2 text-xl font-extrabold text-navy">{t('formTitle')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('formBody')}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="jobId" className="text-sm font-semibold text-navy">
            {t('position')}
          </label>
          <select
            id="jobId"
            name="jobId"
            className={fieldClass()}
            value={selectedJobId || ''}
            onChange={(e) => onJobChange(e.target.value || null)}
          >
            <option value="">{t('generalApplication')}</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {isAr ? job.titleAr : job.titleEn}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-navy">
            {t('name')}
            <span className="text-primary">*</span>
          </label>
          <input id="name" name="name" type="text" required className={fieldClass()} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-navy">
            {t('email')}
            <span className="text-primary">*</span>
          </label>
          <input id="email" name="email" type="email" required className={fieldClass()} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="phone" className="text-sm font-semibold text-navy">
            {t('phone')}
            <span className="text-primary">*</span>
          </label>
          <input id="phone" name="phone" type="tel" required className={fieldClass()} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="coverLetter" className="text-sm font-semibold text-navy">
            {t('coverLetter')}
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            rows={4}
            className={`${fieldClass()} resize-y`}
            placeholder={t('coverLetterPlaceholder')}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="cv" className="text-sm font-semibold text-navy">
            {t('cv')}
            <span className="text-primary">*</span>
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="block w-full text-sm text-muted-foreground file:me-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
          />
          <p className="text-xs text-muted-foreground">{t('cvHint')}</p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? t('sending') : t('submit')}
        {!pending ? <ArrowRight className="h-4 w-4 rtl:rotate-180" /> : null}
      </button>
    </form>
  )
}
