import { plainTextResponse, resolveIndexNowKey } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ key: string }> }

/** Serves /{key}.txt when key matches the configured IndexNow key (admin or env). */
export async function GET(_req: Request, ctx: Ctx) {
  const { key } = await ctx.params
  const configured = await resolveIndexNowKey()
  if (!configured || key !== configured) {
    return new Response('Not found', { status: 404 })
  }
  return plainTextResponse(configured, 3600)
}
