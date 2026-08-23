'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CareersJobsList } from '@/components/careers-jobs-list'
import { JobApplicationForm } from '@/components/job-application-form'
import { Reveal } from '@/components/reveal'
import type { ApiJob } from '@/lib/api'

export function CareersContent({ jobs }: { jobs: ApiJob[] }) {
  const t = useTranslations('careersPage')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:py-20">
      <Reveal>
        <div>
          <h2 className="text-2xl font-extrabold text-navy md:text-3xl">{t('positionsTitle')}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t('positionsBody')}
          </p>
          <div className="mt-8">
            <CareersJobsList
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelect={setSelectedJobId}
            />
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <JobApplicationForm
          jobs={jobs}
          selectedJobId={selectedJobId}
          onJobChange={setSelectedJobId}
        />
      </Reveal>
    </div>
  )
}
