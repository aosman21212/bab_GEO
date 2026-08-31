'use client'

import Image from 'next/image'
import { Check, Globe, Mail, MessageCircle, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { PageContent } from '@/lib/site-content'
import type { LandingType } from '@/lib/page-categories'
import {
  buildWhatsAppUrl,
  DEFAULT_OFFICIAL_EMAIL,
  DEFAULT_OFFICIAL_WEBSITE,
  DEFAULT_PROFILE_DESCRIPTION_AR,
  DEFAULT_PROFILE_DESCRIPTION_EN,
  DEFAULT_WHATSAPP_DISPLAY,
  DEFAULT_WHATSAPP_PHONE,
} from '@/lib/landing-defaults'
import { Link } from '@/i18n/navigation'
import { ContactForm } from '@/components/contact-form'
import { LandingChromeHider } from '@/components/landing-chrome-hider'
import { Reveal } from '@/components/reveal'

export function LandingPage({
  page,
  landingType,
}: {
  page: PageContent
  landingType: LandingType
}) {
  const locale = useLocale()
  const t = useTranslations('landingPage')
  const isAr = locale === 'ar'

  const highlights = page.highlights?.filter(Boolean) ?? []
  const waPhone = page.whatsappPhone?.trim() || DEFAULT_WHATSAPP_PHONE
  const waDisplay = page.whatsappDisplayName?.trim() || DEFAULT_WHATSAPP_DISPLAY
  const officialWebsite = page.officialWebsite?.trim() || DEFAULT_OFFICIAL_WEBSITE
  const officialEmail = page.officialEmail?.trim() || DEFAULT_OFFICIAL_EMAIL
  const profileDescription =
    page.profileDescription?.trim() ||
    (isAr ? DEFAULT_PROFILE_DESCRIPTION_AR : DEFAULT_PROFILE_DESCRIPTION_EN)
  const waMessage = page.ctaLabel?.trim() || (isAr ? 'احجز عرضاً' : 'Book a demo')
  const waUrl = buildWhatsAppUrl(waPhone, waMessage)

  return (
    <>
      <LandingChromeHider />
      <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f7f6fb_0%,#ffffff_45%)]">
        <header className="border-b border-border/60 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/logo-bab.png"
                alt="BAB"
                width={120}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <Link
              href="/contact-us"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {t('headerCta')}
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <section className="mx-auto grid max-w-7xl items-start gap-10 px-6 py-12 md:grid-cols-2 md:py-16 lg:gap-14">
            <Reveal>
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary">{page.eyebrow}</p>
              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-navy md:text-4xl lg:text-5xl">
                {page.heroHeading}
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                {page.heroDescription}
              </p>
              {highlights.length > 0 ? (
                <ul className="mt-8 space-y-3">
                  {highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-navy md:text-base">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>

            <Reveal delay={0.1}>
              {landingType === 'lead-form' ? (
                <div>
                  <ContactForm
                    sourceSlug={page.slug}
                    openWhatsAppAfterSubmit
                    submitLabel={page.ctaLabel || undefined}
                  />
                  {page.formNote ? (
                    <p className="mt-3 text-center text-xs text-muted-foreground">{page.formNote}</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-white p-6 shadow-lg md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                      <MessageCircle className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {t('whatsappBusiness')}
                      </p>
                      <p className="text-lg font-extrabold text-navy">{waDisplay}</p>
                    </div>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {page.ctaLabel || t('chatOnWhatsApp')}
                  </a>

                  <dl className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <dt className="font-semibold text-navy">{t('whatsappPhone')}</dt>
                        <dd className="text-muted-foreground">+{waPhone.replace(/^\+/, '')}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <dt className="font-semibold text-navy">{t('officialWebsite')}</dt>
                        <dd>
                          <a
                            href={officialWebsite}
                            className="text-muted-foreground hover:text-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {officialWebsite.replace(/^https?:\/\//, '')}
                          </a>
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <dt className="font-semibold text-navy">{t('officialEmail')}</dt>
                        <dd>
                          <a href={`mailto:${officialEmail}`} className="text-muted-foreground hover:text-primary">
                            {officialEmail}
                          </a>
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <p className="mt-6 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
                    {profileDescription}
                  </p>
                </div>
              )}
            </Reveal>
          </section>

          {page.image ? (
            <section className="mx-auto max-w-7xl px-6 pb-14">
              <Reveal>
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                  <Image
                    src={page.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </div>
              </Reveal>
            </section>
          ) : null}
        </main>

        <footer className="border-t border-white/10 bg-navy text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm md:flex-row">
            <p className="text-white/60">© {new Date().getFullYear()} BAB International Corp</p>
            <nav className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/privacy-policy" className="text-white/80 transition hover:text-primary">
                {t('privacy')}
              </Link>
              <Link href="/contact-us" className="text-white/80 transition hover:text-primary">
                {t('contact')}
              </Link>
              <Link href="/" className="text-white/80 transition hover:text-primary">
                {t('home')}
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </>
  )
}
