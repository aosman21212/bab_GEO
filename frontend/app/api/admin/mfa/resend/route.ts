import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const forwardedFor =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ''
    const userAgent = req.headers.get('user-agent') || ''

    const res = await fetchBackend('/api/auth/mfa/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
        ...(userAgent ? { 'user-agent': userAgent } : {}),
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[admin/mfa/resend] connection error:', (err as Error)?.message || err)
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable. Please try again.' },
      { status: 503 },
    )
  }
}
