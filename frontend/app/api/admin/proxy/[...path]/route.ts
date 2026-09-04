import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api'
import { ADMIN_SESSION_COOKIE, clearAdminSessionCookie, setAdminSessionCookie } from '@/lib/admin-session'

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: Request, ctx: Ctx) {
  return proxy(req, ctx, 'GET')
}
export async function POST(req: Request, ctx: Ctx) {
  return proxy(req, ctx, 'POST')
}
export async function PUT(req: Request, ctx: Ctx) {
  return proxy(req, ctx, 'PUT')
}
export async function PATCH(req: Request, ctx: Ctx) {
  return proxy(req, ctx, 'PATCH')
}
export async function DELETE(req: Request, ctx: Ctx) {
  return proxy(req, ctx, 'DELETE')
}

function isBinaryContentType(contentType: string | null) {
  if (!contentType) return false
  const ct = contentType.toLowerCase()
  return (
    ct.includes('application/pdf') ||
    ct.includes('application/msword') ||
    ct.includes('application/vnd.openxmlformats') ||
    ct.includes('application/octet-stream') ||
    ct.startsWith('image/') ||
    ct.startsWith('audio/') ||
    ct.startsWith('video/')
  )
}

function slideSession(response: NextResponse, token: string) {
  if (response.status === 401) {
    clearAdminSessionCookie(response)
    return response
  }
  if (response.status >= 200 && response.status < 300) {
    setAdminSessionCookie(response, token)
  }
  return response
}

function tokenForSlide(upstream: Response, fallback: string) {
  return upstream.headers.get('x-admin-token') || fallback
}

async function proxy(req: Request, ctx: Ctx, method: string) {
  try {
    const { path } = await ctx.params
    const jar = await cookies()
    const token = jar.get(ADMIN_SESSION_COOKIE)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const targetPath = `/api/${path.join('/')}${url.search}`

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    }
    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      headers['Content-Type'] = 'application/json'
      body = await req.text()
    }

    const res = await fetchBackend(targetPath, { method, headers, body })
    const contentType = res.headers.get('Content-Type') || 'application/json'
    const disposition = res.headers.get('Content-Disposition')
    const nextToken = tokenForSlide(res, token)

    if (isBinaryContentType(contentType) || disposition?.includes('attachment')) {
      const buf = await res.arrayBuffer()
      const outHeaders: HeadersInit = { 'Content-Type': contentType }
      if (disposition) outHeaders['Content-Disposition'] = disposition
      return slideSession(new NextResponse(buf, { status: res.status, headers: outHeaders }), nextToken)
    }

    const text = await res.text()
    return slideSession(
      new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': contentType },
      }),
      nextToken,
    )
  } catch (err) {
    console.error('[admin/proxy] connection error:', (err as Error)?.message || err)
    return NextResponse.json(
      { error: 'Backend service temporarily unavailable.' },
      { status: 503 },
    )
  }
}
