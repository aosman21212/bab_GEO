import { bingSiteAuthXml, getBingSiteAuthCode } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

/** Serves Bing Webmaster Tools site ownership XML. */
export async function GET() {
  const code = getBingSiteAuthCode()
  if (!code) {
    return new Response('BING_SITE_AUTH_CODE not configured', { status: 404 })
  }
  return new Response(bingSiteAuthXml(code), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=300',
    },
  })
}
