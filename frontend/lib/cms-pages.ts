import type { Locale } from '@/i18n/routing'
import type { PageContent } from '@/lib/site-content'
import { getLocalizedPage } from '@/lib/localized-content'
import { getApiUrl } from '@/lib/api'

function mapToPageContent(raw: Record<string, unknown>, slug: string): PageContent | null {
  if (raw.status === 'draft') return null

  const impact = (raw.impact as { heading?: string; text?: string } | undefined) ?? {
    heading: '',
    text: '',
  }

  return {
    slug,
    category: (raw.category as PageContent['category']) || 'solution',
    metaTitle: String(raw.metaTitle ?? ''),
    metaDescription: String(raw.metaDescription ?? ''),
    eyebrow: String(raw.eyebrow ?? ''),
    heroHeading: String(raw.heroHeading ?? ''),
    heroDescription: String(raw.heroDescription ?? ''),
    ctaLabel: String(raw.ctaLabel ?? 'Contact Us'),
    image: String(raw.image ?? '/images/bab-hero.png'),
    features: raw.features as PageContent['features'],
    benefits: raw.benefits as PageContent['benefits'],
    useCases: raw.useCases as PageContent['useCases'],
    impact: {
      heading: String(impact.heading ?? ''),
      text: String(impact.text ?? ''),
    },
  }
}

/** Load a solution/industry page from CMS API; fall back to static content. */
export async function fetchCmsPage(
  slug: string,
  locale: Locale,
  timeoutMs = 4000
): Promise<PageContent | undefined> {
  const fallback = getLocalizedPage(slug, locale)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${getApiUrl()}/api/pages/${encodeURIComponent(slug)}?locale=${locale}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    })

    if (res.status === 404) return undefined
    if (!res.ok) return fallback

    const raw = (await res.json()) as Record<string, unknown>
    if (raw.status === 'draft') return undefined

    const mapped = mapToPageContent(raw, slug)
    return mapped ?? fallback
  } catch {
    return fallback
  } finally {
    clearTimeout(timer)
  }
}
