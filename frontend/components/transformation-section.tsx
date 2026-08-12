'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from './reveal'

export function TransformationSection() {
  const t = useTranslations('transformation')

  return (
    <section id="about" className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal scaleIn className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image src="/images/home.jpg" alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-navy/88" />
          </div>
          <div className="relative max-w-3xl p-8 md:p-14 lg:p-16">
            <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
              {t('badge')}
            </span>
            <h2 className="mt-6 text-2xl font-extrabold leading-tight text-white md:text-3xl lg:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{t('body')}</p>
            <Link
              href="/about-us"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/95 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
            >
              {t('cta')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
