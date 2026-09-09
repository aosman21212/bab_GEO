import {
  buildUrlsetXml,
  htmlSitemapEntriesForLocale,
  sitemapXmlResponse,
  type SitemapLocale,
} from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

const LOCALES = new Set<SitemapLocale>(['en', 'ar'])

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params
  const locale = file.replace(/\.xml$/i, '') as SitemapLocale
  if (!LOCALES.has(locale) || file.toLowerCase() !== `${locale}.xml`) {
    return new Response('Not found', { status: 404 })
  }

  const entries = await htmlSitemapEntriesForLocale(locale)
  return sitemapXmlResponse(buildUrlsetXml(entries))
}
