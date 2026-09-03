import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'
import { setAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: Request) {
  const body = await req.json()
  const forwardedFor =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    ''
  const userAgent = req.headers.get('user-agent') || ''

  const res = await fetch(`${getApiUrl()}/api/auth/mfa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      ...(userAgent ? { 'user-agent': userAgent } : {}),
    },
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
