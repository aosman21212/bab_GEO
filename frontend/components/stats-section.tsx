'use client'

import { useTranslations } from 'next-intl'
import { StaggerGroup, StaggerItem } from './reveal'
import { CountUp } from './motion-utils'

export function StatsSection() {
  const t = useTranslations('stats')
  const milestones = [
    { key: 'sms', year: 1999 },
    { key: 'vas', year: 2004 },
    { key: 'language', year: 2006 },
    { key: 'ott', year: 2015 },
    { key: 'nlu', year: 2018 },
    { key: 'genai', year: 2021 },
  ] as const

  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map((m) => (
            <StaggerItem
              key={m.key}
              hoverLift
              className="rounded-2xl border border-border border-b-4 border-b-primary bg-background p-8 text-center shadow-sm"
            >
              <h3 className="text-base font-semibold text-navy">{t(m.key)}</h3>
              <p className="mt-3 text-4xl font-extrabold text-primary">
                <CountUp to={m.year} />
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
