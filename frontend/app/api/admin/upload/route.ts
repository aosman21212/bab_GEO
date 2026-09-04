import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api'
import { ADMIN_SESSION_COOKIE, setAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: Request) {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_SESSION_COOKIE)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const res = await fetchBackend('/api/uploads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })

    const text = await res.text()
    const response = new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
    if (res.ok) setAdminSessionCookie(response, token)
    return response
  } catch (err) {
    console.error('[admin/upload] connection error:', (err as Error)?.message || err)
    return NextResponse.json(
      { error: 'Backend service temporarily unavailable.' },
      { status: 503 },
    )
  }
}
