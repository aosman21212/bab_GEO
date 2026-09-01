'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import {
  AdminPageForm,
  emptyLocaleForm,
  localeFromApi,
  localeToApi,
  type LocaleFormData,
  type PageMetaForm,
} from '@/components/admin-page-form'
import type { PageCategory, LandingType } from '@/lib/page-categories'
import { cmsPublicPagePath } from '@/lib/public-urls'

type PageDoc = {
  slug: string
  category: PageCategory
  landingType?: LandingType
  status?: 'published' | 'draft'
  locales: {
    en?: Record<string, unknown>
    ar?: Record<string, unknown>
  }
}

export default function AdminLibraryEditPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const router = useRouter()
  const { t } = useAdminLocale()
  const [locale, setLocale] = useState<'en' | 'ar'>('en')
  const [page, setPage] = useState<PageDoc | null>(null)
  const [meta, setMeta] = useState<PageMetaForm>({
    slug,
    category: 'solution',
    status: 'published',
  })
  const [enForm, setEnForm] = useState<LocaleFormData>(emptyLocaleForm())
  const [arForm, setArForm] = useState<LocaleFormData>(emptyLocaleForm())
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/admin/proxy/pages/by-id/${slug}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) {
        setMessage(t('common.pageNotFound'))
        return
      }
      const data = (await res.json()) as PageDoc
      setPage(data)
      setMeta({
        slug: data.slug,
        category: data.category,
        landingType: data.landingType || 'lead-form',
        status: data.status || 'published',
      })
      setEnForm(localeFromApi(data.locales?.en))
      setArForm(localeFromApi(data.locales?.ar))
    }
    load()
  }, [slug, router, t])

  const activeForm = locale === 'ar' ? arForm : enForm
  const setActiveForm = locale === 'ar' ? setArForm : setEnForm

  const save = async () => {
    setPending(true)
    setMessage(null)
    const locales = {
      en: localeToApi(enForm),
      ar: localeToApi(arForm),
    }
    const res = await fetch(`/api/admin/proxy/pages/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: meta.category,
        landingType: meta.category === 'landing' ? meta.landingType || 'lead-form' : undefined,
        status: meta.status,
        locales,
      }),
    })
    setPending(false)
    if (!res.ok) {
      setMessage(t('common.saveFailed'))
      return
    }
    const updated = (await res.json()) as PageDoc
    setPage(updated)
    setMessage(t('common.saved'))
  }

  const remove = async () => {
    if (!confirm(t('library.deleteConfirm'))) return
    const res = await fetch(`/api/admin/proxy/pages/${slug}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/library')
  }

  if (!page && !message) {
    return (
      <AdminShell
        title={t('library.editTitle')}
        description={t('library.loadingDescription', { slug })}
      >
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={t('library.editTitle')}
      description={t('library.editDescription', { slug })}
      locale={locale}
      onLocaleChange={setLocale}
      actions={
        <div className="flex gap-2">
          {meta.status === 'published' ? (
            <a
              href={cmsPublicPagePath(locale, slug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" /> {t('library.viewPage')}
            </a>
          ) : null}
          <button
            type="button"
            onClick={remove}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
          >
            {t('common.delete')}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? t('common.saving') : t('common.save')}
          </button>
        </div>
      }
    >
      {message ? <p className="mb-4 text-sm text-muted-foreground">{message}</p> : null}
      <AdminPageForm
        locale={locale}
        meta={meta}
        onMetaChange={setMeta}
        value={activeForm}
        onChange={setActiveForm}
        slugEditable={false}
      />
    </AdminShell>
  )
}
