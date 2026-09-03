import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'
import { ADMIN_SESSION_COOKIE, clearAdminSessionCookie } from '@/lib/admin-session'

export async function POST() {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (token) {
    try {
      await fetch(`${getApiUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      /* still clear the cookie */
    }
  }

  const response = NextResponse.json({ ok: true })
  clearAdminSessionCookie(response)
  return response
}
