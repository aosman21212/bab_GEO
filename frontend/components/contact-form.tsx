'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { submitInquiry } from '@/lib/api'

export function ContactForm() {
  const t = useTranslations('form')
  const locale = useLocale()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const fields = [
    { name: 'name', label: t('name'), type: 'text', required: true },
    { name: 'company', label: t('company'), type: 'text', required: false },
    { name: 'phone', label: t('phone'), type: 'tel', required: true },
    { name: 'email', label: t('email'), type: 'email', required: true },
  ]

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
  }

  if (sent) {
    return (
      <div className="border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-navy">{t('thanksTitle')}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t('thanksBody')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col gap-2">
          <label htmlFor={f.name} className="text-sm font-medium text-navy">
            {f.label}
            {f.required && <span className="text-primary">*</span>}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            required={f.required}
            className="border border-border bg-card px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-primary"
          />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <label htmlFor="project" className="text-sm font-medium text-navy">
          {t('project')}
          <span className="text-primary">*</span>
        </label>
        <textarea
          id="project"
          name="project"
          required
          rows={5}
          className="resize-none border border-border bg-card px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-primary"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-fit items-center gap-2 bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? '…' : t('send')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </form>
  )
}
