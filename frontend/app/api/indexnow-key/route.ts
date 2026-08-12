import { getIndexNowKey, plainTextResponse } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

/** Serves the IndexNow ownership key body (also mirrored to public/{key}.txt by rotate script). */
export async function GET() {
  const key = getIndexNowKey()
  if (!key) {
    return new Response('INDEXNOW_KEY not configured', { status: 404 })
  }
  return plainTextResponse(key, 3600)
}
