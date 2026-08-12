import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/geo-content'

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
