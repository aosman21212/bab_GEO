'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Briefcase, MapPin, Building2 } from 'lucide-react'
import type { ApiJob } from '@/lib/api'

function typeLabel(
  t: (key: string) => string,
  type: ApiJob['employmentType'],
) {
  if (type === 'part-time') return t('typePartTime')
  if (type === 'contract') return t('typeContract')
  if (type === 'internship') return t('typeInternship')
  return t('typeFullTime')
}

export function CareersJobsList({
  jobs,
  selectedJobId,
  onSelect,
}: {
  jobs: ApiJob[]
  selectedJobId: string | null
  onSelect: (jobId: string | null) => void
}) {
  const t = useTranslations('careersPage')
  const locale = useLocale()
  const isAr = locale === 'ar'

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center">
        <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-semibold text-navy">{t('emptyTitle')}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t('emptyBody')}</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {jobs.map((job) => {
        const title = isAr ? job.titleAr : job.titleEn
        const department = isAr ? job.departmentAr : job.departmentEn
        const location = isAr ? job.locationAr : job.locationEn
        const description = isAr ? job.descriptionAr : job.descriptionEn
        const selected = selectedJobId === job._id

        return (
          <li key={job._id}>
            <button
              type="button"
              onClick={() => onSelect(selected ? null : job._id)}
              className={`w-full rounded-2xl border bg-white p-5 text-start transition ${
                selected
                  ? 'border-primary shadow-sm ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-navy">{title}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
                    {department ? (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {department}
                      </span>
                    ) : null}
                    {location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {location}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {typeLabel(t, job.employmentType)}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-navy'
                  }`}
                >
                  {selected ? t('selected') : t('apply')}
                </span>
              </div>
              {description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
