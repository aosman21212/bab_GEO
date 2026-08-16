import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

function safeName(raw: string) {
  const base = path.basename(raw)
  if (!base || base !== raw || base.includes('..')) return null
  return base
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ filename: string }> },
) {
  const { filename: raw } = await ctx.params
  const filename = safeName(decodeURIComponent(raw))
  if (!filename) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
  try {
    await access(filePath)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const buf = await readFile(filePath)
  const ext = path.extname(filename).toLowerCase()
  const type = MIME[ext] || 'application/octet-stream'

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Content-Length': String(buf.byteLength),
    },
  })
}
