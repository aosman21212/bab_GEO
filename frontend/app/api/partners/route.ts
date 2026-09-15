import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Public proxy so the browser never calls Express (or localhost) directly. */
export async function GET() {
  try {
    const res = await fetchBackend('/api/partners', { cache: 'no-store' })
    const data = await res.json().catch(() => [])
    return NextResponse.json(Array.isArray(data) ? data : [], { status: res.ok ? 200 : res.status })
  } catch {
    return NextResponse.json([])
  }
}
