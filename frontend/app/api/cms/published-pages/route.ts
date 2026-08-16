import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Public proxy so the browser can load CMS nav extras same-origin. */
export async function GET() {
  try {
    const res = await fetch(`${getApiUrl()}/api/pages/meta/published`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to load published pages' }, { status: 502 })
  }
}
