import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

const COOKIE = 'bab_admin_token'

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
  response.cookies.set(COOKIE, data.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
