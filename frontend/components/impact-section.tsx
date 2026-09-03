'use client'

import Image from '@/components/app-image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from './reveal'
import { DEFAULT_IMPACT_IMAGE, type HomepageLocaleData } from '@/lib/homepage-content'

export function ImpactSection({ content }: { content?: HomepageLocaleData['impact'] }) {
  const t = useTranslations('impact')
  const alt = useTranslations('imageAlt')

  return (
    <section className="pb-8 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal scaleIn className="relative overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0">
            <Image
              src={content?.image || DEFAULT_IMPACT_IMAGE}
              alt={alt('impactBg')}
              fill
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-navy/90" />
          </div>
          <div className="relative flex flex-col items-start gap-6 px-8 py-14 md:flex-row md:items-center md:justify-between md:px-14 md:py-16 lg:px-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold leading-tight text-white md:text-3xl lg:text-4xl">
                {content?.title || t('title')}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-white/75">
                {content?.body || t('body')}
              </p>
            </div>
            <Link
              href="/contact-us"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {content?.cta || t('cta')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
