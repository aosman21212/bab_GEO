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
  const pillars = ['connect', 'engage', 'analyze'] as const

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold text-primary">{t('eyebrow')}</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
            {t('title')}
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = icons[p]
            return (
              <StaggerItem
                key={p}
                hoverLift
                className="rounded-2xl border border-border bg-background p-8 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-sm font-extrabold tracking-widest text-navy">{t(`${p}.label`)}</p>
                <h3 className="mt-2 text-lg font-bold text-navy">{t(`${p}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`${p}.body`)}</p>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <p
          aria-hidden
          className="pointer-events-none mt-14 select-none text-center text-4xl font-extrabold tracking-tight text-navy/10 md:text-6xl lg:text-7xl"
        >
          <span className="text-navy/25">{t('watermark').split(' ').slice(0, 2).join(' ')}</span>{' '}
          <span className="text-navy/10">{t('watermark').split(' ').slice(2).join(' ')}</span>
        </p>
      </div>
    </section>
  )
}
