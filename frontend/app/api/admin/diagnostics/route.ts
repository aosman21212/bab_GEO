import { NextResponse } from 'next/server'
import { backendCandidateUrls, backendErrorCode, getApiUrl } from '@/lib/api'

export const dynamic = 'force-dynamic'

const PROBE_TIMEOUT_MS = 3000

/**
 * Reports which backend hosts this Next.js server can actually reach, so a login 503 can be
 * told apart from a misconfigured API address without shell access to the server.
 * Response carries only hostnames and Node error codes — never credentials or env values.
 */
export async function GET() {
  const candidates = backendCandidateUrls()

  const hosts = await Promise.all(
    candidates.map(async (baseUrl) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
      const startedAt = Date.now()
      try {
        const res = await fetch(`${baseUrl}/api/health`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        return {
          url: baseUrl,
          reachable: res.ok,
          status: res.status,
          ms: Date.now() - startedAt,
        }
      } catch (err) {
        return {
          url: baseUrl,
          reachable: false,
          status: 0,
          ms: Date.now() - startedAt,
          code: controller.signal.aborted ? 'ETIMEDOUT' : backendErrorCode(err),
        }
      } finally {
        clearTimeout(timer)
      }
    }),
  )

  const reachable = hosts.filter((host) => host.reachable)

  return NextResponse.json(
    {
      ok: reachable.length > 0,
      primary: getApiUrl(),
      apiUrlConfigured: Boolean(process.env.API_URL?.trim()),
      hosts,
      hint:
        reachable.length > 0
          ? null
          : 'No backend host answered /api/health. Check that the Express container is running: docker compose ps && docker compose logs --tail=50 backend',
    },
    { status: reachable.length > 0 ? 200 : 503 },
  )
}
