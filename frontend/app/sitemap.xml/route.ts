import { buildSitemapIndexXml, sitemapXmlResponse } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

export function GET() {
  return sitemapXmlResponse(buildSitemapIndexXml())
}
