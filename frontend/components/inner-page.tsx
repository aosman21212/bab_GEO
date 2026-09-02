import Image from '@/components/app-image'
import { ArrowRight, Check } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { PageContent } from '@/lib/site-content'
import { Link } from '@/i18n/navigation'
import { Reveal, StaggerGroup, StaggerItem } from './reveal'

export async function InnerPage({ page }: { page: PageContent }) {
  const t = await getTranslations('common')
  const cta = page.ctaLabel?.trim() || t('contactUs')

  return (
    <div className="flex flex-col">
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">{page.eyebrow}</p>
            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight text-navy md:text-4xl lg:text-5xl">
              {page.heroHeading}
            </h1>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              {page.heroDescription}
            </p>
            <Link
              href="/contact-us"
              className="mt-8 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={page.image || '/images/bab-hero.png'}
                alt={page.heroHeading}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      {page.features && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              {page.features.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-2xl font-extrabold text-navy md:text-4xl">
              {page.features.heading}
            </h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {page.features.cards.map((card) => (
              <StaggerItem key={card.title}>
                <div className="flex h-full flex-col border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                  <span className="text-lg font-extrabold text-primary">{card.accent}</span>
                  <h3 className="mt-2 text-lg font-bold text-navy">{card.title}</h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {card.points.map((pt) => (
                      <li key={pt} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {page.benefits && (
        <section className="px-4 py-12 sm:px-6 md:py-16">
          <div className="relative mx-auto max-w-7xl overflow-hidden">
            <Image
              src="/images/home.jpg"
              alt={`${page.benefits.heading} — ${page.metaTitle}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-navy/90" />
            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <Reveal className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-balance text-2xl font-extrabold text-white md:text-3xl">
                  {page.benefits.heading}
                </h2>
                <span className="w-fit bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                  {page.metaTitle}
                </span>
              </Reveal>
              <StaggerGroup className="mt-8 flex flex-col gap-4">
                {page.benefits.items.map((item) => (
                  <StaggerItem key={item.title}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                      <p className="text-sm leading-relaxed text-white/85">
                        <span className="font-semibold text-white">{item.title}:</span> {item.desc}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </section>
      )}

      {page.useCases && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <Reveal>
            <h2 className="text-balance text-2xl font-extrabold text-navy md:text-4xl">
              {page.useCases.heading}
            </h2>
          </Reveal>
          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2">
            {page.useCases.items.map((item) => (
              <StaggerItem key={item}>
                <div className="flex items-start gap-3 border border-border bg-card p-5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/80">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      <section className="px-4 py-12 sm:px-6 md:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden">
          <Image
            src="/images/bg-ss3.webp"
            alt={`${page.impact.heading} — ${page.metaTitle}`}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative max-w-2xl px-6 py-14 md:px-12 md:py-20">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                {t('realWorldImpact')}
              </p>
              <h2 className="mt-4 text-balance text-2xl font-extrabold text-white md:text-4xl">
                {page.impact.heading}
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-white/80">{page.impact.text}</p>
              <Link
                href="/contact-us"
                className="mt-8 inline-flex items-center gap-2 bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('contactUs')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
