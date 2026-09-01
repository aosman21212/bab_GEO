import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'
import { setAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: Request) {
  const body = await req.json()
  const res = await fetch(`${getApiUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const response = NextResponse.json({ ok: true, user: data.user })
  setAdminSessionCookie(response, data.token)
  return response
}
