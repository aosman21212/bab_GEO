import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { collectSitemapUrls, getIndexNowKey, getSiteUrl } from '@/lib/geo-content'
import { ADMIN_SESSION_COOKIE, setAdminSessionCookie } from '@/lib/admin-session'

function slideSession(response: NextResponse, token: string) {
  setAdminSessionCookie(response, token)
  return response
}

export async function GET() {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const site = getSiteUrl()
  const key = getIndexNowKey()
  const urls = await collectSitemapUrls()

  return slideSession(
    NextResponse.json({
      siteUrl: site,
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

export async function POST() {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = getIndexNowKey()
  const site = getSiteUrl()
  if (!key) {
    return NextResponse.json(
      { error: 'INDEXNOW_KEY is not set. Run npm run seo:rotate-indexnow-key' },
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
