import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

const COOKIE = 'bab_admin_token'

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

async function proxy(req: Request, ctx: Ctx, method: string) {
  const { path } = await ctx.params
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const target = `${getApiUrl()}/api/${path.join('/')}${url.search}`

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  }
  let body: string | undefined
  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json'
    body = await req.text()
  }

  const res = await fetch(target, { method, headers, body })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  })
}
