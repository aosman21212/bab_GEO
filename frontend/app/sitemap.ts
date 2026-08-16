import type { MetadataRoute } from 'next'
import { collectSitemapUrls, getSiteUrl, loadPublishedPages, localePath } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await loadPublishedPages()
  const site = getSiteUrl()
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/llms.txt`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]

  const staticPaths = ['', 'about-us', 'contact-us', 'privacy-policy', 'terms-conditions', 'sitemap']
  for (const locale of ['en', 'ar'] as const) {
    for (const path of staticPaths) {
      entries.push({
        url: localePath(locale, path),
        lastModified: now,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 0.9 : 0.7,
      })
    }
    for (const page of pages) {
      entries.push({
        url: localePath(locale, page.slug),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Ensure uniqueness if collectSitemapUrls grows elsewhere
  const seen = new Set<string>()
  return entries.filter((e) => {
    if (seen.has(e.url)) return false
    seen.add(e.url)
    return true
  })
}

/** Helper for IndexNow — same URL set as sitemap. */
export async function getSitemapUrlList() {
  return collectSitemapUrls()
}
