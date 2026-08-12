import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

const COOKIE = 'bab_admin_token'

export async function POST(req: Request) {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const res = await fetch(`${getApiUrl()}/api/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  })
}
