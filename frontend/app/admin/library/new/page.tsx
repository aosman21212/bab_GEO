'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import {
  AdminPageForm,
  emptyLocaleForm,
  localeToApi,
  type LocaleFormData,
  type PageMetaForm,
} from '@/components/admin-page-form'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminLibraryNewPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [locale, setLocale] = useState<'en' | 'ar'>('en')
  const [meta, setMeta] = useState<PageMetaForm>({
    slug: '',
    category: 'solution',
    status: 'published',
  })
  const [enForm, setEnForm] = useState<LocaleFormData>(emptyLocaleForm())
  const [arForm, setArForm] = useState<LocaleFormData>(emptyLocaleForm())
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const activeForm = locale === 'ar' ? arForm : enForm
  const setActiveForm = (next: LocaleFormData) => {
    if (locale === 'ar') {
      setArForm(next)
      return
    }
    setEnForm(next)
    if (!slugTouched && next.heroHeading) {
      setMeta((m) => ({ ...m, slug: slugify(next.heroHeading) }))
    }
  }

  const onMetaChange = (next: PageMetaForm) => {
    if (next.slug !== meta.slug) setSlugTouched(true)
    setMeta(next)
  }

  const submit = async () => {
    setPending(true)
    setError(null)
    if (!meta.slug) {
      setPending(false)
      setError(t('library.slugRequired'))
      return
    }
    const res = await fetch('/api/admin/proxy/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: meta.slug,
        category: meta.category,
        status: meta.status,
        locales: {
          en: localeToApi(enForm),
          ar: localeToApi(arForm),
        },
      }),
    })
    setPending(false)
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(
        typeof data.error === 'string'
          ? data.error
          : data.error?.formErrors?.[0] || t('common.createFailed'),
      )
      return
    }
    router.push(`/admin/library/${meta.slug}`)
  }

  return (
    <AdminShell
      title={t('library.newTitle')}
      description={t('library.newDescription')}
      locale={locale}
      onLocaleChange={setLocale}
      actions={
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? t('library.creating') : t('library.create')}
        </button>
      }
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <AdminPageForm
        locale={locale}
        meta={meta}
        onMetaChange={onMetaChange}
        value={activeForm}
        onChange={setActiveForm}
        slugEditable
      />
    </AdminShell>
  )
}
