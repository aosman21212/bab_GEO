'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { submitInquiry } from '@/lib/api'
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_PHONE } from '@/lib/landing-defaults'

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-navy outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
}

export function ContactForm({
  sourceSlug,
  openWhatsAppAfterSubmit = true,
  submitLabel,
  variant = 'default',
}: {
  sourceSlug?: string
  openWhatsAppAfterSubmit?: boolean
  submitLabel?: string
  variant?: 'default' | 'landing'
}) {
  const t = useTranslations('form')
  const locale = useLocale()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isLanding = variant === 'landing'

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const fd = new FormData(e.currentTarget)
    const result = await submitInquiry({
      name: String(fd.get('name') || ''),
      company: String(fd.get('company') || '') || undefined,
      phone: String(fd.get('phone') || ''),
      email: String(fd.get('email') || ''),
      project: String(fd.get('project') || ''),
      locale: locale === 'ar' ? 'ar' : 'en',
      sourceSlug,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent(true)
    if (openWhatsAppAfterSubmit) {
      const message = submitLabel || (locale === 'ar' ? 'احجز عرضاً' : 'Book a demo')
      window.open(buildWhatsAppUrl(DEFAULT_WHATSAPP_PHONE, message), '_blank', 'noopener,noreferrer')
    }
  }

  const cardClass = isLanding
    ? 'relative overflow-hidden rounded-2xl border border-border bg-white shadow-lg'
    : 'rounded-2xl border border-border bg-white shadow-sm'

  if (sent) {
    return (
      <div className={`${cardClass} p-8`}>
        {isLanding ? (
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#a855f7] to-[#6366f1]"
            aria-hidden
          />
        ) : null}
        <p className="text-[11px] font-bold tracking-[0.14em] text-primary">BAB</p>
        <h2 className="mt-2 text-xl font-extrabold text-navy">{t('thanksTitle')}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t('thanksBody')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={cardClass}>
      {isLanding ? (
        <div
          className="h-1 bg-gradient-to-r from-primary via-[#a855f7] to-[#6366f1]"
          aria-hidden
        />
      ) : null}
      <div className="p-6 md:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-navy">
              {t('name')}
              <span className="text-primary">*</span>
            </label>
            <input id="name" name="name" type="text" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="company" className="text-sm font-semibold text-navy">
              {t('company')}
            </label>
            <input id="company" name="company" type="text" className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-semibold text-navy">
              {t('phone')}
              <span className="text-primary">*</span>
            </label>
            <input id="phone" name="phone" type="tel" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-navy">
              {t('email')}
              <span className="text-primary">*</span>
            </label>
            <input id="email" name="email" type="email" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="project" className="text-sm font-semibold text-navy">
              {t('project')}
              <span className="text-primary">*</span>
            </label>
            <textarea
              id="project"
              name="project"
              required
              rows={5}
              className={`${fieldClass()} resize-none`}
            />
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 ${
            isLanding ? 'w-full' : 'w-full sm:w-auto'
          }`}
        >
          {pending ? '…' : submitLabel || t('send')}{' '}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </form>
  )
}
