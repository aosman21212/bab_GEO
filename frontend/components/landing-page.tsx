'use client'

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
  formatWhatsAppPhoneDisplay,
} from '@/lib/landing-defaults'
import { ContactForm } from '@/components/contact-form'
import { LandingChromeHider } from '@/components/landing-chrome-hider'
import { LandingImageSlider } from '@/components/landing-image-slider'
import { LandingHeader } from '@/components/landing-header'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { buildLandingSlideImages } from '@/lib/landing-slides'

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
  const waMessage = page.ctaLabel?.trim() || t('defaultCtaLabel')
  const waUrl = buildWhatsAppUrl(waPhone, waMessage)
  const isWhatsApp = landingType === 'whatsapp'
  const slideImages = buildLandingSlideImages(page)

  return (
    <>
      <LandingChromeHider />
      <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f7f6fb_0%,#ffffff_35%)]">
        <LandingHeader />

        <main className="flex-1">
          <section className="mx-auto grid max-w-7xl items-start gap-10 px-6 py-14 md:grid-cols-2 md:py-20 lg:gap-14 lg:py-24">
            <Reveal>
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary">{page.eyebrow}</p>
              <h1
                className={`mt-3 text-balance text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl ${
                  isWhatsApp ? 'leading-snug' : 'leading-tight'
                }`}
              >
                {page.heroHeading}
              </h1>
              <p
                className={`mt-4 max-w-xl text-pretty text-base text-muted-foreground md:text-lg ${
                  isWhatsApp ? 'leading-7 md:leading-8' : 'leading-relaxed'
                }`}
              >
                {page.heroDescription}
              </p>
              {highlights.length > 0 ? (
                <ul className={`mt-8 ${isWhatsApp ? 'space-y-4' : 'space-y-3'}`}>
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
                    variant="landing"
                    sourceSlug={page.slug}
                    openWhatsAppAfterSubmit
                    submitLabel={page.ctaLabel || undefined}
                  />
                  {page.formNote ? (
                    <p className="mt-3 text-center text-xs text-muted-foreground">{page.formNote}</p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-lg md:p-8">
                  <div className="flex items-center gap-3">
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
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {page.ctaLabel || t('chatOnWhatsApp')}
                  </a>

                  <dl className="space-y-5 text-sm md:text-base">
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="space-y-1">
                        <dt className="font-semibold text-navy">{t('whatsappPhone')}</dt>
                        <dd className="text-muted-foreground">{formatWhatsAppPhoneDisplay(waPhone)}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 space-y-1">
                        <dt className="font-semibold text-navy">{t('officialWebsite')}</dt>
                        <dd>
                          <a
                            href={officialWebsite}
                            className="break-words text-muted-foreground hover:text-primary"
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
                      <div className="min-w-0 space-y-1">
                        <dt className="font-semibold text-navy">{t('officialEmail')}</dt>
                        <dd>
                          <a
                            href={`mailto:${officialEmail}`}
                            className="break-words text-muted-foreground hover:text-primary"
                          >
                            {officialEmail}
                          </a>
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <p className="rounded-xl bg-muted/50 p-5 text-sm leading-7 text-muted-foreground md:text-base">
                    {profileDescription}
                  </p>
                </div>
              )}
            </Reveal>
          </section>

          {slideImages.length > 0 ? <LandingImageSlider images={slideImages} /> : null}
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
