'use client'

import Image from '@/components/app-image'
import { useTranslations } from 'next-intl'
import { Reveal } from './reveal'
import { usePrefersReducedMotion } from './motion-utils'

function LogosMarquee() {
  const reduced = usePrefersReducedMotion()
  const alt = useTranslations('imageAlt')
  const partnersAlt = alt('partnersLogos')

  if (reduced) {
    return (
      <Image
        src="/images/bab-partners-logos.png"
        alt={partnersAlt}
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
            alt={partnersAlt}
            width={1400}
            height={180}
            className="h-auto w-[min(1400px,92vw)] shrink-0 object-contain opacity-80"
            priority={copy === 0}
          />
        ))}
      </div>
    </div>
  )
}

export function OurWorksSection() {
  const t = useTranslations('works')

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold text-navy md:text-4xl">{t('title')}</h2>
        </Reveal>

        <Reveal className="mt-10 overflow-hidden rounded-2xl border border-border/70 bg-background px-4 py-5 sm:px-6 sm:py-6 md:mt-12">
          <LogosMarquee />
        </Reveal>
      </div>
    </section>
  )
}
