import { NextResponse } from 'next/server'

const COOKIE = 'bab_admin_token'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}
