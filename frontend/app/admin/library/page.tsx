'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Search, ExternalLink } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import {
  categoryCommonKey,
  PAGE_CATEGORIES,
  type PageCategory,
} from '@/lib/page-categories'
import { homepageTitleFromLocales } from '@/lib/homepage-content'
import { cmsPublicPagePath } from '@/lib/public-urls'
import { withBasePath } from '@/lib/base-path'

type PageDoc = {
  _id: string
  slug: string
  category: PageCategory
  landingType?: string
  status?: 'published' | 'draft'
  locales: {
    en?: Record<string, unknown>
    ar?: Record<string, unknown>
  }
}

type Filter = 'all' | PageCategory

export default function AdminLibraryPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [pages, setPages] = useState<PageDoc[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')

  const load = async () => {
    const res = await fetch(withBasePath('/api/admin/proxy/pages'))
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    const data = await res.json().catch(() => [])
    setPages(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    load()
  }, [])

  const listed = useMemo(() => {
    const hasHome = pages.some((p) => p.slug === 'home' || p.category === 'home')
    const next = [...pages]
    if (!hasHome) {
      next.unshift({
        _id: 'home',
        slug: 'home',
        category: 'home',
        status: 'published',
        locales: {
          en: { metaTitle: 'Home' },
          ar: { metaTitle: 'الرئيسية' },
        },
      })
    }
    next.sort((a, b) => {
      const ah = a.slug === 'home' || a.category === 'home' ? 0 : 1
      const bh = b.slug === 'home' || b.category === 'home' ? 0 : 1
      return ah - bh
    })
    return next
  }, [pages])

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: listed.length }
    for (const cat of PAGE_CATEGORIES) {
      next[cat] = listed.filter((p) => p.category === cat).length
    }
    return next
  }, [listed])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return listed.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false
      if (!query) return true
      const homeTitles = homepageTitleFromLocales(p.locales)
      const en = String(
        p.locales?.en?.metaTitle || p.locales?.en?.heroHeading || homeTitles.en || '',
      )
      const ar = String(
        p.locales?.ar?.metaTitle || p.locales?.ar?.heroHeading || homeTitles.ar || '',
      )
      return (
        p.slug.toLowerCase().includes(query) ||
        en.toLowerCase().includes(query) ||
        ar.toLowerCase().includes(query)
      )
    })
  }, [listed, filter, q])

  const pills: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: t('common.all'), count: counts.all },
    { id: 'home', label: t('library.home'), count: counts.home ?? 0 },
    { id: 'solution', label: t('library.solutions'), count: counts.solution },
    { id: 'industry', label: t('library.industries'), count: counts.industry },
    { id: 'product', label: t('library.products'), count: counts.product },
    { id: 'case-study', label: t('library.caseStudies'), count: counts['case-study'] },
    { id: 'article', label: t('library.articles'), count: counts.article },
    { id: 'landing', label: t('library.landings'), count: counts.landing },
  ]

  return (
    <AdminShell
      title={t('library.title')}
      description={t('library.description')}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/library/home"
            className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-primary hover:text-primary"
          >
            <Pencil className="h-4 w-4" /> {t('library.editHomepage')}
          </Link>
          <Link
            href="/admin/library/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> {t('library.addContent')}
          </Link>
        </div>
      }
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(pill.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === pill.id
                  ? 'border border-navy/25 bg-white text-navy shadow-sm'
                  : 'border border-transparent bg-transparent text-muted-foreground hover:text-navy'
              }`}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-full border border-border bg-white py-2.5 pe-4 ps-10 text-sm outline-none focus:border-primary"
            placeholder={t('library.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('common.title')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.type')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.slug')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.status')}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const homeTitles = homepageTitleFromLocales(p.locales)
              const enTitle =
                String(
                  p.locales?.en?.metaTitle ||
                    p.locales?.en?.heroHeading ||
                    homeTitles.en ||
                    p.slug,
                )
              const arTitle =
                String(
                  p.locales?.ar?.metaTitle ||
                    p.locales?.ar?.heroHeading ||
                    p.locales?.ar?.eyebrow ||
                    homeTitles.ar ||
                    '',
                )
              const status = p.status || 'published'
              return (
                <tr key={p._id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-navy">{enTitle}</p>
                    {arTitle ? (
                      <p className="mt-0.5 text-xs text-muted-foreground" dir="rtl">
                        {arTitle}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-[#e8ecf4] px-2.5 py-1 text-xs font-semibold text-navy">
                      {t(`common.${categoryCommonKey(p.category)}`)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="rounded-md bg-muted px-2 py-1 text-xs text-navy/80">
                      {p.slug}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {status === 'published' ? t('common.published') : t('common.draft')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Link
                        href={`/admin/library/${p.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                      </Link>
                      {status === 'published' ? (
                        <>
                          <a
                            href={cmsPublicPagePath('en', p.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> {t('library.openEn')}
                          </a>
                          <a
                            href={cmsPublicPagePath('ar', p.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> {t('library.openAr')}
                          </a>
                        </>
                      ) : (
                        <>
                          <span
                            className="text-sm text-muted-foreground"
                            title={t('library.draftNotPublic')}
                          >
                            EN
                          </span>
                          <span
                            className="text-sm text-muted-foreground"
                            title={t('library.draftNotPublic')}
                          >
                            AR
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  {t('library.empty')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
