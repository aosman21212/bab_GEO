import { NextResponse } from 'next/server'
import { backendErrorCode, getApiUrl } from '@/lib/api'

export const dynamic = 'force-dynamic'

const PROBE_TIMEOUT_MS = 3000

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function probeHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return '(invalid-url)'
  }
}

/**
 * Dev-only connectivity probe. Production returns 404 so the backend origin is not public.
 */
export async function GET() {
  if (isProduction()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const baseUrl = getApiUrl()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  const startedAt = Date.now()

  let host: {
    host: string
    reachable: boolean
    status: number
    ms: number
    code?: string
  }

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    host = {
      host: probeHost(baseUrl),
      reachable: res.ok,
      status: res.status,
      ms: Date.now() - startedAt,
    }
  } catch (err) {
    host = {
      host: probeHost(baseUrl),
      reachable: false,
      status: 0,
      ms: Date.now() - startedAt,
      code: controller.signal.aborted ? 'ETIMEDOUT' : backendErrorCode(err),
    }
  } finally {
    clearTimeout(timer)
  }

  return NextResponse.json(
    {
      ok: host.reachable,
      host: host.host,
      status: host.status,
      ms: host.ms,
      ...(host.code ? { code: host.code } : {}),
    },
    { status: host.reachable ? 200 : 503 },
  )
}
