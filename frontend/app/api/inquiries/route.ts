import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Proxies public contact/demo form submissions to the Express backend. */
export async function POST(req: Request) {
  const body = await req.text()
  const res = await fetch(`${getApiUrl()}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
