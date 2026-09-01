import type { NextResponse } from 'next/server'
import { basePath } from '@/lib/base-path'

export const ADMIN_SESSION_COOKIE = 'bab_admin_token'
export const ADMIN_SESSION_IDLE_MS = 5 * 60 * 1000
export const ADMIN_SESSION_COOKIE_MAX_AGE = 5 * 60

const COOKIE_PATH = basePath || '/'

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: COOKIE_PATH,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE,
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    path: COOKIE_PATH,
    maxAge: 0,
  })
}
