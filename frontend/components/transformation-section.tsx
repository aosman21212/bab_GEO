'use client'

import Image from '@/components/app-image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from './reveal'

export function TransformationSection() {
  const t = useTranslations('transformation')
  const alt = useTranslations('imageAlt')

  return (
    <section id="about" className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal scaleIn className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] md:min-h-[380px]">
          <div className="absolute inset-0">
            <Image
              src="/images/riyadh-skyline.png"
              alt={alt('transformationBg')}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-navy/80" />
          </div>
          <div className="relative flex h-full min-h-[320px] max-w-3xl flex-col justify-center p-8 md:min-h-[380px] md:p-14 lg:p-16">
            <h2 className="text-2xl font-extrabold leading-tight text-white md:text-3xl lg:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{t('body')}</p>
            <Link
              href="/about-us"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
            >
              {t('cta')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
