'use client'

import { Link2, MessageCircle, BarChart3 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Reveal, StaggerGroup, StaggerItem } from './reveal'
import { PILLAR_IDS, WORK_IDS, type HomepageLocaleData } from '@/lib/homepage-content'

const icons = {
  connect: Link2,
  engage: MessageCircle,
  analyze: BarChart3,
} as const

export function ExperienceSection({
  works,
  experience,
}: {
  works?: HomepageLocaleData['works']
  experience?: HomepageLocaleData['experience']
}) {
  const t = useTranslations('experience')
  const tw = useTranslations('works')

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <StaggerGroup className="mb-14 grid gap-8 border-b border-border/70 pb-14 md:grid-cols-3 md:gap-10">
          {WORK_IDS.map((key) => (
            <StaggerItem key={key} className="text-center md:text-start">
              <h3 className="text-base font-bold text-primary md:text-lg">
                {works?.items[key].title || tw(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {works?.items[key].body || tw(`items.${key}.body`)}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold text-primary">
            {experience?.eyebrow || t('eyebrow')}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
            {experience?.title || t('title')}
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {PILLAR_IDS.map((p) => {
            const Icon = icons[p]
            const pillar = experience?.[p]
            return (
              <StaggerItem key={p} hoverLift className="px-2 py-4 text-center md:px-4">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <p className="mt-5 text-xs font-extrabold tracking-[0.18em] text-navy">
                  {pillar?.label || t(`${p}.label`)}
                </p>
                <h3 className="mt-2 text-lg font-bold text-navy">
                  {pillar?.title || t(`${p}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pillar?.body || t(`${p}.body`)}
                </p>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}
