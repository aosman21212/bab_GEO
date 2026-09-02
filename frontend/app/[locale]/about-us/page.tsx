'use client'

import Image from '@/components/app-image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/reveal'

const stats = [
  { value: '25+', labelKey: 'statYears' },
  { value: '4', labelKey: 'statOffices' },
  { value: '100+', labelKey: 'statProjects' },
  { value: '20+', labelKey: 'statSolutions' },
  { value: '70+', labelKey: 'statPartners' },
  { value: '50+', labelKey: 'statPros' },
] as const

const milestones = [
  { year: '1999', key: 'm1999' },
  { year: '2000', key: 'm2000' },
  { year: '2002', key: 'm2002' },
  { year: '2010', key: 'm2010' },
  { year: '2015', key: 'm2015' },
] as const

const values = [
  { key: 'v1' },
  { key: 'v2' },
  { key: 'v3' },
  { key: 'v4' },
] as const

export default function AboutPage() {
  const t = useTranslations('about')
  const imageAlt = useTranslations('imageAlt')
  const common = useTranslations('common')

  return (
    <div className="flex flex-col">
      <section className="bg-secondary pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-balance text-3xl font-extrabold leading-tight text-navy md:text-5xl">
                  {t('title')}
                </h1>
                <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">{t('intro')}</p>
              </div>
              <Link
                href="/contact-us"
                className="inline-flex w-fit shrink-0 items-center gap-2 bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary"
              >
                {t('contact')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative mt-10 aspect-[21/9] overflow-hidden">
              <Image
                src="/images/bg-about.webp"
                alt={imageAlt('aboutHeroBg')}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1280px"
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <StaggerItem key={s.labelKey}>
              <div className="border border-border bg-card p-6">
                <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.labelKey)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/images/bab-hero.png" alt={imageAlt('aboutEngineering')} fill className="object-cover" sizes="50vw" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-2xl font-extrabold text-navy md:text-3xl">{t('engineer')}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t('engineerBody')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-navy md:text-4xl">{t('empowering')}</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{t('empoweringBody')}</p>
        </Reveal>

        <Reveal className="mt-12">
          <h3 className="text-xl font-bold text-navy">{t('milestones')}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((m) => (
              <div key={m.year} className="border border-border bg-card p-5">
                <p className="text-lg font-extrabold text-primary">{m.year}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(m.key)}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <h3 className="text-xl font-bold text-navy">{t('missionVision')}</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="border border-border bg-card p-6">
              <p className="font-extrabold text-primary">{t('mission')}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('missionBody')}</p>
            </div>
            <div className="border border-border bg-card p-6">
              <p className="font-extrabold text-primary">{t('vision')}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('visionBody')}</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <h3 className="text-2xl font-extrabold text-navy">{t('valuesTitle')}</h3>
          <p className="mt-3 max-w-3xl text-muted-foreground">{t('valuesBody')}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.key} className="border border-border bg-card p-6">
                <p className="font-bold text-navy">{t(`${v.key}Title`)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(`${v.key}Body`)}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-6 py-12 md:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden">
          <Image src="/images/bg-ss3.webp" alt={imageAlt('aboutImpactBg')} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative max-w-2xl px-6 py-14 md:px-12 md:py-20">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              {common('realWorldImpact')}
            </p>
            <h2 className="mt-4 text-2xl font-extrabold text-white md:text-4xl">{t('valuesTitle')}</h2>
            <Link
              href="/contact-us"
              className="mt-8 inline-flex items-center gap-2 bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
            >
              {common('contactUs')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
