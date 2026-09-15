import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Public proxy so the browser never calls Express (or localhost) directly. */
export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('locale')
  const path = locale
    ? `/api/testimonials?locale=${encodeURIComponent(locale)}`
    : '/api/testimonials'
  try {
    const res = await fetchBackend(path, { cache: 'no-store' })
    const data = await res.json().catch(() => [])
    return NextResponse.json(Array.isArray(data) ? data : [], { status: res.ok ? 200 : res.status })
  } catch {
    return NextResponse.json([])
  }
}
