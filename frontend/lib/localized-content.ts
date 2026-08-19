import type { Locale } from '@/i18n/routing'
import { getPage, type PageContent } from '@/lib/site-content'
import { arPageOverlays } from '@/lib/ar-page-overlays'

export { arPageOverlays }

export function getLocalizedPage(slug: string, locale: Locale): PageContent | undefined {
  const page = getPage(slug)
  if (!page) return undefined
  if (locale !== 'ar') return page

  const overlay = arPageOverlays[slug]
  if (!overlay) return page

  return {
    ...page,
    ...overlay,
    features: overlay.features ?? page.features,
    benefits: overlay.benefits ?? page.benefits,
    useCases: overlay.useCases ?? page.useCases,
    impact: overlay.impact ?? page.impact,
  }
}
