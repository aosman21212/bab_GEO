import { getGoogleSiteVerification, googleSiteVerificationHtml } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

/** Google Search Console HTML verification file. */
export async function GET() {
  const code = getGoogleSiteVerification()
  if (!code) {
    return new Response('GOOGLE_SITE_VERIFICATION not configured', { status: 404 })
  }
  return new Response(googleSiteVerificationHtml(code), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=300',
    },
  })
}
