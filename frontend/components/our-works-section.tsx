'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Reveal, StaggerGroup, StaggerItem } from './reveal'
import { usePrefersReducedMotion } from './motion-utils'

function LogosMarquee() {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return (
      <Image
        src="/images/bab-partners-logos.png"
        alt=""
        width={1400}
        height={180}
        className="h-auto w-full object-contain opacity-80"
      />
    )
  }

  return (
    <div className="group/marquee max-w-full overflow-hidden" dir="ltr">
      <div className="bab-marquee flex w-max items-center gap-8 group-hover/marquee:[animation-play-state:paused] sm:gap-10">
        {[0, 1].map((copy) => (
          <Image
            key={copy}
            src="/images/bab-partners-logos.png"
            alt=""
            width={1400}
            height={180}
            className="h-auto w-[min(1400px,90vw)] shrink-0 object-contain opacity-80"
            priority={copy === 0}
          />
        ))}
      </div>
    </div>
  )
}

export function OurWorksSection() {
  const t = useTranslations('works')
  const keys = ['productivity', 'experience', 'reporting'] as const

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-navy md:text-4xl">{t('title')}</h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <StaggerGroup className="flex flex-col gap-5">
            {keys.map((key) => (
              <StaggerItem
                key={key}
                hoverLift
                className="rounded-2xl border border-border bg-background p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-primary">{t(`items.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.body`)}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal
            scaleIn
            className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:aspect-auto lg:min-h-[520px]"
          >
            <Image
              src="/images/support-headset.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </Reveal>
        </div>

        <Reveal className="mt-14 overflow-hidden rounded-2xl border border-border bg-background p-6">
          <LogosMarquee />
        </Reveal>
      </div>
    </section>
  )
}
