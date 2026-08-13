'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { submitInquiry } from '@/lib/api'

const BOOK_DEMO_WHATSAPP =
  'https://api.whatsapp.com/send?phone=966920035161&text=Book+a+demo'

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-navy outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
}

export function ContactForm() {
  const t = useTranslations('form')
  const locale = useLocale()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent(true)
    window.open(BOOK_DEMO_WHATSAPP, '_blank', 'noopener,noreferrer')
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <p className="text-[11px] font-bold tracking-[0.14em] text-primary">BAB</p>
        <h2 className="mt-2 text-xl font-extrabold text-navy">{t('thanksTitle')}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t('thanksBody')}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
    >
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
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? '…' : t('send')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </form>
  )
}
