'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from './reveal'
import { usePrefersReducedMotion } from './motion-utils'
import { fetchPartners, type ApiPartner } from '@/lib/api'

const fallbackSlugs = [
  'meta',
  'liveperson',
  'insider',
  'apple',
  'avaya',
  'aws',
  'microsoft',
  'cloudera',
  'genesys',
  'ibm',
  'oracle',
  'google-cloud',
]

function PartnerCell({
  slug,
  name,
  logoUrl,
}: {
  slug: string
  name?: string
  logoUrl: string
}) {
  const label = name || slug
  return (
    <div
      className="flex h-12 w-[100px] shrink-0 items-center justify-center rounded-xl bg-white/20 px-2.5 sm:h-14 sm:w-[120px] sm:px-3 md:w-[132px]"
      title={label}
    >
      <Image
        src={logoUrl}
        alt={label}
        width={100}
        height={40}
        className="max-h-6 w-auto object-contain brightness-0 invert sm:max-h-7"
      />
    </div>
  )
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: { slug: string; name?: string; logoUrl: string }[]
  reverse?: boolean
}) {
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const reduced = usePrefersReducedMotion()
  const track = [...items, ...items]
  const scrollReverse = isRtl ? !reverse : reverse

  if (reduced) {
    return (
      <div className="flex max-w-full flex-wrap justify-center gap-2 sm:gap-2.5">
        {items.map((p) => (
          <PartnerCell key={p.slug} slug={p.slug} name={p.name} logoUrl={p.logoUrl} />
        ))}
      </div>
    )
  }

  return (
    <div className="group/marquee max-w-full overflow-hidden" dir="ltr">
      <div
        className={`flex w-max gap-2 sm:gap-2.5 ${scrollReverse ? 'bab-marquee-reverse' : 'bab-marquee'} group-hover/marquee:[animation-play-state:paused]`}
      >
        {track.map((p, i) => (
          <PartnerCell
            key={`${p.slug}-${i}`}
            slug={p.slug}
            name={p.name}
            logoUrl={p.logoUrl}
          />
        ))}
      </div>
    </div>
  )
}

function toItems(partners: ApiPartner[] | null) {
  if (partners?.length) {
    return partners.map((p) => ({
      slug: p.slug,
      name: p.name,
      logoUrl: p.logoUrl,
    }))
  }
  return fallbackSlugs.map((slug) => ({
    slug,
    name: slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    logoUrl: `/images/partners/${slug}.png`,
  }))
}

export function PartnersSection() {
  const t = useTranslations('partners')
  const [partners, setPartners] = useState<ApiPartner[] | null>(null)

  useEffect(() => {
    fetchPartners().then(setPartners)
  }, [])

  const items = toItems(partners)
  const mid = Math.ceil(items.length / 2)
  const rowA = items.slice(0, mid)
  const rowB = items.slice(mid)

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8 md:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold leading-tight md:text-3xl">{t('title')}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/90">{t('body')}</p>
              <Link
                href="/contact-us"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                {t('cta')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="flex min-w-0 max-w-full flex-col gap-2.5 overflow-hidden sm:gap-3">
              <MarqueeRow items={rowA} />
              <MarqueeRow items={rowB} reverse />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
