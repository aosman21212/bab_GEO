'use client'

import { useEffect, useState } from 'react'
import Image from '@/components/app-image'
import { useLocale, useTranslations } from 'next-intl'
import { Reveal } from '@/components/reveal'
import { usePrefersReducedMotion } from '@/components/motion-utils'
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

function PartnerLogo({
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
      className="flex h-14 w-[120px] shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white px-3 sm:h-16 sm:w-[140px]"
      title={label}
    >
      <Image
        src={logoUrl}
        alt={label}
        width={110}
        height={44}
        className="max-h-8 w-auto object-contain opacity-80 grayscale transition hover:opacity-100 sm:max-h-9"
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
      <div className="flex max-w-full flex-wrap justify-center gap-3">
        {items.map((p) => (
          <PartnerLogo key={p.slug} slug={p.slug} name={p.name} logoUrl={p.logoUrl} />
        ))}
      </div>
    )
  }

  return (
    <div className="group/marquee max-w-full overflow-hidden" dir="ltr">
      <div
        className={`flex w-max gap-3 sm:gap-4 ${scrollReverse ? 'bab-marquee-reverse' : 'bab-marquee'} group-hover/marquee:[animation-play-state:paused]`}
      >
        {track.map((p, i) => (
          <PartnerLogo
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

export function LandingPartnersSlider() {
  const t = useTranslations('landingPage')
  const [partners, setPartners] = useState<ApiPartner[] | null>(null)

  useEffect(() => {
    fetchPartners().then(setPartners)
  }, [])

  const items = toItems(partners)
  const mid = Math.ceil(items.length / 2)
  const rowA = items.slice(0, mid)
  const rowB = items.slice(mid)

  return (
    <section className="bg-muted/40 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-6 text-center text-sm font-bold uppercase tracking-[0.14em] text-primary">
            {t('partnersTitle')}
          </p>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white p-4 shadow-md sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <MarqueeRow items={rowA} />
              <MarqueeRow items={rowB} reverse />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
