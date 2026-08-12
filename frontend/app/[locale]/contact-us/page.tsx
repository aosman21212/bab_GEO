'use client'

import { useLocale, useTranslations } from 'next-intl'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'
import { Reveal } from '@/components/reveal'

export default function ContactPage() {
  const t = useTranslations('contactPage')
  const s = useTranslations('siteSettings')
  const locale = useLocale()

  const address = locale === 'ar' ? s('addressAr') : s('addressEn')
  const hours = locale === 'ar' ? s('hoursAr') : s('hoursEn')
  const phone = s('phone')
  const email = s('email')
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`

  return (
    <div className="flex flex-col">
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <Reveal>
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-navy md:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{t('body')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col gap-6 bg-navy p-8">
            <h2 className="text-xl font-bold text-white">{t('info')}</h2>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-white">{t('address')}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-white">{t('phone')}</p>
                <a
                  href={phoneHref}
                  className="mt-1 block text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-white">{t('email')}</p>
                <a
                  href={`mailto:${email}`}
                  className="mt-1 block text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-white">Hours</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{hours}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
