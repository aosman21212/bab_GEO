'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { BabLogo } from './bab-logo'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from './social-icons'

const socials = [
  {
    icon: FacebookIcon,
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100086215290185',
  },
  {
    icon: YoutubeIcon,
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UCUMxO0j0IZdnLLRd1QUa6Zw',
  },
  {
    icon: LinkedinIcon,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/bab-international-corp-for-specialized-services',
  },
  { icon: XIcon, label: 'X', href: 'https://x.com/babportal' },
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/bab.portal/' },
]

const MAPS_URL = 'https://maps.app.goo.gl/s4Lvq93xyFv5QEpW7?g_st=awb'

export function SiteFooter() {
  const t = useTranslations('footer')
  const s = useTranslations('siteSettings')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [sent, setSent] = useState(false)

  const address = locale === 'ar' ? s('addressAr') : s('addressEn')
  const phone = s('phone')
  const mail = s('email')
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`

  const companyLinks = [
    { label: t('home'), href: '/' },
    { label: t('about'), href: '/about-us' },
    { label: t('privacy'), href: '/privacy-policy' },
    { label: t('terms'), href: '/terms-conditions' },
    { label: t('contact'), href: '/contact-us' },
    { label: t('sitemap'), href: '/sitemap' },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !agreed) return
    setSent(true)
    setEmail('')
    setAgreed(false)
  }

  return (
    <footer id="contact" className="mt-16 bg-muted md:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16">
        <div className="mb-10">
          <BabLogo size="lg" />
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">{t('company')}</h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">{t('address')}</h4>
            <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {address}
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              {t('viewMaps')}
            </a>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">{t('inquiries')}</h4>
            <a
              href={phoneHref}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              {phone}
            </a>
            <a
              href={`mailto:${mail}`}
              className="mt-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              {mail}
            </a>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">{t('newsletter')}</h4>
            <p className="mb-4 text-sm text-muted-foreground">{t('newsletterBody')}</p>
            {sent ? (
              <p className="text-sm font-medium text-primary">{t('subscribed')}</p>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="flex items-center overflow-hidden rounded-full border border-border bg-card p-1 ps-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  {t('agree')}
                </label>
              </form>
            )}

            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground md:text-start">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
