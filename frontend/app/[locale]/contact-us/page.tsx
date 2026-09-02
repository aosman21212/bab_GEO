'use client'

import Image from '@/components/app-image'
import { useLocale, useTranslations } from 'next-intl'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'
import { Reveal } from '@/components/reveal'
import { trackBookDemoClick } from '@/lib/analytics'

const BOOK_DEMO_WHATSAPP =
  'https://api.whatsapp.com/send?phone=966920035161&text=Book+a+demo'

/** Sales inbox for Contact Us inquiries (distinct from general siteSettings.email). */
const CONTACT_SALES_EMAIL = 'sales@bab.com.sa'

export default function ContactPage() {
  const t = useTranslations('contactPage')
  const imageAlt = useTranslations('imageAlt')
  const s = useTranslations('siteSettings')
  const locale = useLocale()

  const address = locale === 'ar' ? s('addressAr') : s('addressEn')
  const hours = locale === 'ar' ? s('hoursAr') : s('hoursEn')
  const phone = s('phone')
  const email = CONTACT_SALES_EMAIL
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  const localeCode = locale === 'ar' ? 'ar' : 'en'

  const trackBookDemo = (buttonLocation: string) => {
    trackBookDemoClick({ buttonLocation, locale: localeCode, method: 'whatsapp' })
  }

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[52vh] overflow-hidden md:min-h-[58vh]">
        <Image
          src="/images/bg-ss3.webp"
          alt={imageAlt('contactHeroBg')}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(26,26,61,0.92) 0%, rgba(26,26,61,0.72) 48%, rgba(230,126,34,0.35) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-end px-6 pb-14 pt-28 md:min-h-[58vh] md:pb-20">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary">{t('brand')}</p>
              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-white md:text-5xl">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/80 md:text-lg">
                {t('body')}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={BOOK_DEMO_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBookDemo('contact-hero')}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('bookDemo')}
                </a>
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" />
                  {t('callUs')}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative bg-[linear-gradient(180deg,#f7f6fb_0%,#ffffff_55%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:py-20">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.12}>
            <aside className="flex h-full flex-col gap-6 rounded-2xl bg-[linear-gradient(165deg,#1a1a3d_0%,#2a2a5c_70%,#1f1f45_100%)] p-7 text-white shadow-lg md:p-8">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-primary">{t('whatsapp')}</p>
                <h2 className="mt-2 text-xl font-extrabold">{t('info')}</h2>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t('address')}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t('phone')}</p>
                    <a
                      href={phoneHref}
                      className="mt-1 block text-sm text-white/70 transition hover:text-primary"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t('email')}</p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 block text-sm text-white/70 transition hover:text-primary"
                    >
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t('hours')}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{hours}</p>
                  </div>
                </div>
              </div>

              <a
                href={BOOK_DEMO_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackBookDemo('contact-sidebar')}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" />
                {t('bookDemo')}
              </a>
            </aside>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
