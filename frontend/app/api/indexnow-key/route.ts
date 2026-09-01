import { plainTextResponse, resolveIndexNowKey } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

/** Serves the IndexNow ownership key body at /api/indexnow-key (rewrite fallback). */
export async function GET() {
  const key = await resolveIndexNowKey()
  if (!key) {
    return new Response('INDEXNOW_KEY not configured', { status: 404 })
  }
  return plainTextResponse(key, 3600)
}
