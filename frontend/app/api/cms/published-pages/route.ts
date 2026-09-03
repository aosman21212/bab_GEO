import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

export const revalidate = 120

function upstreamHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return '(invalid-url)'
  }
}

/** Public proxy so the browser can load CMS nav extras same-origin. */
export async function GET() {
  const base = getApiUrl()
  const upstream = `${base}/api/pages/meta/published`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(upstream, {
      next: { revalidate: 120 },
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error(
        `[cms/published-pages] upstream ${upstreamHost(upstream)} returned ${res.status}`,
      )
      return NextResponse.json([])
    }
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[cms/published-pages] fetch failed host=${upstreamHost(upstream)}: ${message}`)
    return NextResponse.json([])
  } finally {
    clearTimeout(timer)
  }
}
