import { plainTextResponse, resolveIndexNowKey } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

/** Serves /{key}.txt when key matches the configured IndexNow key (admin or env). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key?: string }> },
) {
  const { key } = await params
  const configured = await resolveIndexNowKey()
  if (!configured || !key || key !== configured) {
    return new Response('Not found', { status: 404 })
  }
  return plainTextResponse(configured, 3600)
}
