'use client'

import { Link2, MessageCircle, BarChart3 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Reveal, StaggerGroup, StaggerItem } from './reveal'

const icons = {
  connect: Link2,
  engage: MessageCircle,
  analyze: BarChart3,
} as const

export function ExperienceSection() {
  const t = useTranslations('experience')
  const tw = useTranslations('works')
  const pillars = ['connect', 'engage', 'analyze'] as const
  const workKeys = ['productivity', 'experience', 'reporting'] as const

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <StaggerGroup className="mb-14 grid gap-8 border-b border-border/70 pb-14 md:grid-cols-3 md:gap-10">
          {workKeys.map((key) => (
            <StaggerItem key={key} className="text-center md:text-start">
              <h3 className="text-base font-bold text-primary md:text-lg">{tw(`items.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tw(`items.${key}.body`)}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold text-primary">{t('eyebrow')}</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
            {t('title')}
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {pillars.map((p) => {
            const Icon = icons[p]
            return (
              <StaggerItem key={p} hoverLift className="px-2 py-4 text-center md:px-4">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <p className="mt-5 text-xs font-extrabold tracking-[0.18em] text-navy">
                  {t(`${p}.label`)}
                </p>
                <h3 className="mt-2 text-lg font-bold text-navy">{t(`${p}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`${p}.body`)}</p>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </div>
    </section>
  )
}
