import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  collectSitemapUrls,
  getSiteUrl,
  INDEXNOW_KEY_PATTERN,
  resolveIndexNowKey,
} from '@/lib/geo-content'
import { getApiUrl } from '@/lib/api'
import { ADMIN_SESSION_COOKIE, setAdminSessionCookie } from '@/lib/admin-session'

function slideSession(response: NextResponse, token: string) {
  setAdminSessionCookie(response, token)
  return response
}

async function loadSiteSettings(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${getApiUrl()}/api/content/admin/en`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return {}
  const docs = (await res.json()) as { key: string; data: Record<string, unknown> }[]
  const doc = docs.find((d) => d.key === 'siteSettings')
  return doc?.data ?? {}
}

async function saveSiteSettings(token: string, data: Record<string, unknown>) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({ data })
  const [enRes, arRes] = await Promise.all([
    fetch(`${getApiUrl()}/api/content/en/siteSettings`, { method: 'PUT', headers, body }),
    fetch(`${getApiUrl()}/api/content/ar/siteSettings`, { method: 'PUT', headers, body }),
  ])
  return enRes.ok && arRes.ok
}

export async function GET() {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const site = getSiteUrl()
  const key = await resolveIndexNowKey()
  const urls = await collectSitemapUrls()

  return slideSession(
    NextResponse.json({
      siteUrl: site,
      indexNowKey: key,
      keyConfigured: Boolean(key),
      keyFileUrl: key ? `${site}/${key}.txt` : null,
      sitemapUrl: `${site}/sitemap.xml`,
      urlCount: urls.length,
      priorityUrls: [
        `${site}`,
        `${site}/ar`,
        `${site}/llms.txt`,
        `${site}/about-us`,
      ],
    }),
    token,
  )
}

export async function PUT(req: Request) {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as { key?: string }
  const key = body.key?.trim() ?? ''
  if (!INDEXNOW_KEY_PATTERN.test(key)) {
    return NextResponse.json(
      { error: 'Invalid key. Use 8–128 alphanumeric characters (and optional hyphens).' },
      { status: 400 },
    )
  }

  const current = await loadSiteSettings(token)
  const ok = await saveSiteSettings(token, { ...current, indexNowKey: key })
  if (!ok) {
    return NextResponse.json({ error: 'Failed to save IndexNow key' }, { status: 502 })
  }

  const site = getSiteUrl()
  return slideSession(
    NextResponse.json({
      ok: true,
      indexNowKey: key,
      keyFileUrl: `${site}/${key}.txt`,
    }),
    token,
  )
}

export async function POST() {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = await resolveIndexNowKey()
  const site = getSiteUrl()
  if (!key) {
    return NextResponse.json(
      { error: 'IndexNow key is not set. Save a key in GEO settings first.' },
      { status: 400 },
    )
  }

  const host = new URL(site).host
  const urlList = await collectSitemapUrls()

  const payload = {
    host,
    key,
    keyLocation: `${site}/${key}.txt`,
    urlList,
  }

  const endpoints = [
    { name: 'IndexNow', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex', url: 'https://yandex.com/indexnow' },
  ]

  const results: { name: string; status: number; ok: boolean; body?: string }[] = []

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      })
      const text = await res.text().catch(() => '')
      results.push({
        name: ep.name,
        status: res.status,
        ok: res.ok || res.status === 200 || res.status === 202,
        body: text.slice(0, 200),
      })
    } catch (err) {
      results.push({
        name: ep.name,
        status: 0,
        ok: false,
        body: err instanceof Error ? err.message : 'Network error',
      })
    }
  }

  const anyOk = results.some((r) => r.ok)
  return slideSession(
    NextResponse.json(
      {
        ok: anyOk,
        urlCount: urlList.length,
        keyLocation: payload.keyLocation,
        results,
        note: 'IndexNow covers Bing, Yandex, Seznam, and Naver — not Google. Use Search Console for Google.',
      },
      { status: anyOk ? 200 : 502 },
    ),
    token,
  )
}
