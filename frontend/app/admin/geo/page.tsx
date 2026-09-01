'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Library,
  RefreshCw,
  Search,
  Settings2,
} from 'lucide-react'
import { withBasePath } from '@/lib/base-path'

type FileStatus = 'unknown' | 'ok' | 'error'

type PurposeKey =
  | 'purposeLlms'
  | 'purposeLlmsFull'
  | 'purposeLlmsSmall'
  | 'purposeRobots'
  | 'purposeSitemap'
  | 'purposeAi'

type CrawlerFile = {
  file: string
  path: string
  purposeKey: PurposeKey
  status: FileStatus
}

type IndexNowMeta = {
  siteUrl: string
  keyConfigured: boolean
  keyFileUrl: string | null
  sitemapUrl: string
  urlCount: number
  priorityUrls: string[]
}

const INITIAL_FILES: Omit<CrawlerFile, 'status'>[] = [
  {
    file: 'llms.txt',
    path: '/llms.txt',
    purposeKey: 'purposeLlms',
  },
  {
    file: 'llms-full.txt',
    path: '/llms-full.txt',
    purposeKey: 'purposeLlmsFull',
  },
  {
    file: 'llms-small.txt',
    path: '/llms-small.txt',
    purposeKey: 'purposeLlmsSmall',
  },
  {
    file: 'robots.txt',
    path: '/robots.txt',
    purposeKey: 'purposeRobots',
  },
  {
    file: 'sitemap.xml',
    path: '/sitemap.xml',
    purposeKey: 'purposeSitemap',
  },
  {
    file: 'ai.txt',
    path: '/.well-known/ai.txt',
    purposeKey: 'purposeAi',
  },
]

function statusPill(
  status: FileStatus,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        {t('geo.ok')}
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
        {t('geo.error')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
      —
    </span>
  )
}

export default function AdminGeoPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [files, setFiles] = useState<CrawlerFile[]>(
    INITIAL_FILES.map((f) => ({ ...f, status: 'unknown' })),
  )
  const [checking, setChecking] = useState(false)
  const [meta, setMeta] = useState<IndexNowMeta | null>(null)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const okCount = useMemo(() => files.filter((f) => f.status === 'ok').length, [files])

  const loadMeta = useCallback(async () => {
    const res = await fetch(withBasePath('/api/admin/indexnow'))
    if (res.status === 401) {
      router.push('/admin')
      return
    }
    if (!res.ok) return
    setMeta((await res.json()) as IndexNowMeta)
  }, [router])

  const recheckOne = async (path: string): Promise<FileStatus> => {
    try {
      const res = await fetch(withBasePath(path), { method: 'GET', cache: 'no-store' })
      return res.ok ? 'ok' : 'error'
    } catch {
      return 'error'
    }
  }

  const recheckFile = async (path: string) => {
    const status = await recheckOne(path)
    setFiles((prev) => prev.map((f) => (f.path === path ? { ...f, status } : f)))
  }

  const checkAll = useCallback(async () => {
    setChecking(true)
    const results = await Promise.all(
      INITIAL_FILES.map(async (f) => ({ path: f.path, status: await recheckOne(f.path) })),
    )
    setFiles((prev) =>
      prev.map((f) => {
        const hit = results.find((r) => r.path === f.path)
        return hit ? { ...f, status: hit.status } : f
      }),
    )
    setChecking(false)
  }, [])

  useEffect(() => {
    loadMeta()
    checkAll()
  }, [loadMeta, checkAll])

  const submitIndexNow = async () => {
    setSubmitting(true)
    setSubmitStatus(null)
    const res = await fetch(withBasePath('/api/admin/indexnow'), { method: 'POST' })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      ok?: boolean
      urlCount?: number
      results?: { name: string; status: number; ok: boolean }[]
      note?: string
    }
    setSubmitting(false)
    if (!res.ok && data.error) {
      setSubmitStatus(data.error)
      return
    }
    const summary = (data.results || [])
      .map((r) => `${r.name}: ${r.ok ? t('geo.ok') : `HTTP ${r.status}`}`)
      .join(' · ')
    setSubmitStatus(
      `${data.ok ? t('geo.submitted') : t('geo.partialFailed')} (${data.urlCount ?? 0} ${t('geo.urls')}). ${summary}. ${data.note || ''}`,
    )
  }

  const siteUrl = meta?.siteUrl || 'https://bab.com.sa'
  const publicUrlConfigured = Boolean(meta?.siteUrl)

  return (
    <AdminShell
      title={t('geo.title')}
      description={t('geo.description')}
      actions={
        <button
          type="button"
          onClick={checkAll}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          {t('geo.checkAll')}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Status banner */}
        <section
          className={`rounded-2xl border p-5 ${
            okCount === 6
              ? 'border-emerald-200 bg-emerald-50/80'
              : 'border-amber-200 bg-amber-50/80'
          }`}
        >
          <div className="flex flex-wrap items-start gap-3">
            <CheckCircle2
              className={`mt-0.5 h-5 w-5 shrink-0 ${okCount === 6 ? 'text-emerald-600' : 'text-amber-600'}`}
            />
            <div>
              <p className="font-semibold text-navy">
                {okCount === 6 ? t('geo.allOk') : t('geo.partialOk', { ok: okCount })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t('geo.shouldShowOk')}</p>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wide text-primary">{t('geo.crawlerFiles')}</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{okCount}/6</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('geo.liveEndpoints')}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wide text-primary">{t('geo.publicSiteUrl')}</p>
            <p className="mt-2 text-lg font-extrabold text-navy">
              {publicUrlConfigured ? t('geo.configured') : t('geo.missing')}
            </p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{siteUrl}</p>
          </div>
          <Link
            href="/admin/settings#geo"
            className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-primary"
          >
            <p className="text-xs font-bold tracking-wide text-primary">{t('geo.yourRole')}</p>
            <p className="mt-2 text-lg font-extrabold text-navy">{t('geo.updateContent')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('geo.roleBody')}</p>
          </Link>
        </div>

        {/* IndexNow */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-navy">{t('geo.indexNowTitle')}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('geo.indexNowBody')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadMeta()}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
              >
                <RefreshCw className="h-4 w-4" /> {t('geo.refreshStatus')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submitIndexNow}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                {submitting ? t('geo.submitting') : t('geo.submitSitemap')}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>
              {t('geo.sitemap')}:{' '}
              <a
                className="font-medium text-navy underline-offset-2 hover:underline"
                href={meta?.sitemapUrl || `${siteUrl}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
              >
                {meta?.sitemapUrl || `${siteUrl}/sitemap.xml`}
              </a>{' '}
              · {meta?.urlCount ?? '—'} {t('geo.urls')}
            </p>
            <p>
              {t('geo.keyFile')}:{' '}
              {meta?.keyFileUrl ? (
                <a
                  className="font-medium text-navy underline-offset-2 hover:underline"
                  href={meta.keyFileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('geo.keyLive')} {meta.keyFileUrl}
                </a>
              ) : (
                <span className="text-amber-700">{t('geo.keyMissing')}</span>
              )}
            </p>
            {submitStatus ? <p className="pt-2 text-navy">{submitStatus}</p> : null}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-muted/80 p-4 text-sm leading-relaxed text-muted-foreground">
            <p>{t('geo.bingHelp')}</p>
            <p className="mt-3">{t('geo.googleHelp')}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-extrabold text-navy">{t('geo.urlsTitle')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('geo.urlsBody')}</p>
            <p className="mt-3 text-xs font-bold tracking-wide text-primary">{t('geo.doFirst')}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(
                meta?.priorityUrls || [
                  siteUrl,
                  `${siteUrl}/ar`,
                  `${siteUrl}/llms.txt`,
                  `${siteUrl}/about-us`,
                ]
              ).map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-navy underline-offset-2 hover:underline"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What is GEO */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-navy">{t('geo.whatIs')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('geo.whatIsBody')}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/60 p-4">
              <p className="text-sm font-bold text-navy">{t('geo.seoVsGeo')}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>{t('geo.seoPoint')}</li>
                <li>{t('geo.geoPoint')}</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-muted/60 p-4">
              <p className="text-sm font-bold text-navy">{t('geo.howWorks')}</p>
              <ul className="mt-2 list-disc space-y-1.5 ps-4 text-sm text-muted-foreground">
                <li>{t('geo.how1')}</li>
                <li>{t('geo.how2')}</li>
                <li>{t('geo.how3')}</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('geo.liveSite')}:{' '}
                <a
                  href={siteUrl}
                  className="font-medium text-navy underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {siteUrl}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Crawler files table */}
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-extrabold text-navy">{t('geo.crawlerSection')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('geo.crawlerSectionBody')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-start text-sm">
              <thead className="bg-muted text-xs font-bold tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-start">{t('geo.file')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start">{t('geo.purpose')}</th>
                  <th className="px-6 py-3 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {files.map((row) => {
                  const absolute = `${siteUrl}${row.path}`
                  return (
                    <tr key={row.file} className="border-t border-border">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-navy">{row.file}</p>
                        <a
                          href={absolute}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 block break-all text-xs text-muted-foreground hover:text-primary"
                        >
                          {absolute}
                        </a>
                      </td>
                      <td className="px-4 py-4">{statusPill(row.status, t)}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {t(`geo.${row.purposeKey}`)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <a
                            href={withBasePath(row.path)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> {t('geo.open')}
                          </a>
                          <button
                            type="button"
                            onClick={() => recheckFile(row.path)}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:border-primary hover:text-primary"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> {t('geo.recheck')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Content that feeds GEO */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-navy">{t('geo.feedsTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('geo.feedsBody')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/settings#faq"
              className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary"
            >
              <FileText className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-navy">{t('geo.feedFaq')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('geo.feedFaqBody')}</p>
              </div>
            </Link>
            <Link
              href="/admin/settings#seo"
              className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary"
            >
              <Settings2 className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-navy">{t('geo.feedSeo')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('geo.feedSeoBody')}</p>
              </div>
            </Link>
            <Link
              href="/admin/settings#geo"
              className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary"
            >
              <FileText className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-navy">{t('geo.feedGeo')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('geo.feedGeoBody')}</p>
              </div>
            </Link>
            <Link
              href="/admin/settings#contact"
              className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary"
            >
              <Search className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-navy">{t('geo.feedContact')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('geo.feedContactBody')}</p>
              </div>
            </Link>
            <Link
              href="/admin/library"
              className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary"
            >
              <Library className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-navy">{t('geo.feedLibrary')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('geo.feedLibraryBody')}</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Checklist */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-navy">{t('geo.checklist')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('geo.checklistBody')}</p>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-muted-foreground">
            <li>{t('geo.tip1')}</li>
            <li>{t('geo.tip2')}</li>
            <li>{t('geo.tip3')}</li>
            <li>{t('geo.tip4')}</li>
            <li>{t('geo.tip5')}</li>
            <li>{t('geo.tip6')}</li>
            <li>{t('geo.tip7')}</li>
            <li>{t('geo.tip8')}</li>
          </ul>
        </section>
      </div>
    </AdminShell>
  )
}
