import { NextResponse } from 'next/server'
import { backendErrorCode, fetchBackend } from '@/lib/api'
import { setAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    // Do not forward client X-Forwarded-For / X-Real-IP — those are spoofable and
    // were used to bypass login rate limits. Express uses the peer (Next) address.
    const userAgent = req.headers.get('user-agent') || ''

    const res = await fetchBackend('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const code = backendErrorCode(err)
    console.error(`[admin/login] connection error ${code}:`, (err as Error)?.message || err)
    return NextResponse.json(
      {
        error: 'Authentication service temporarily unavailable. Please try again.',
        ...(process.env.NODE_ENV === 'production' ? {} : { detail: code }),
      },
      { status: 503 },
    )
  }
}
