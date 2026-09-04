import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api'
import { setAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const forwardedFor =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ''
    const userAgent = req.headers.get('user-agent') || ''

    const res = await fetchBackend('/api/auth/login', {
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

    if (data.mfaRequired) {
      return NextResponse.json({
        mfaRequired: true,
        mfaToken: data.mfaToken,
        email: data.email,
        expiresAt: data.expiresAt,
        resendCooldownSeconds: data.resendCooldownSeconds,
      })
    }

    const response = NextResponse.json({ ok: true, user: data.user })
    setAdminSessionCookie(response, data.token)
    return response
  } catch (err) {
    console.error('[admin/login] connection error:', (err as Error)?.message || err)
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable. Please try again.' },
      { status: 503 },
    )
  }
}
