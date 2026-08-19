import type { Locale } from '@/i18n/routing'
import type { PageContent } from '@/lib/site-content'
import { getLocalizedPage } from '@/lib/localized-content'
import { getApiUrl } from '@/lib/api'

const arabicRe = /[\u0600-\u06FF]/

function hasArabic(value: unknown): boolean {
  return typeof value === 'string' && arabicRe.test(value)
}

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
    ctaLabel: String(raw.ctaLabel ?? ''),
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

/** Prefer CMS fields, but keep static Arabic sections when CMS still has English bodies. */
function mergeLocalizedPage(cms: PageContent, fallback: PageContent): PageContent {
  const pickSection = <T extends { heading?: string }>(
    cmsSection: T | undefined,
    fallbackSection: T | undefined,
  ): T | undefined => {
    if (cmsSection && hasArabic(cmsSection.heading)) return cmsSection
    return fallbackSection ?? cmsSection
  }

  return {
    ...fallback,
    ...cms,
    metaTitle: hasArabic(cms.metaTitle) ? cms.metaTitle : fallback.metaTitle || cms.metaTitle,
    metaDescription: hasArabic(cms.metaDescription)
      ? cms.metaDescription
      : fallback.metaDescription || cms.metaDescription,
    eyebrow: hasArabic(cms.eyebrow) ? cms.eyebrow : fallback.eyebrow || cms.eyebrow,
    heroHeading: hasArabic(cms.heroHeading) ? cms.heroHeading : fallback.heroHeading || cms.heroHeading,
    heroDescription: hasArabic(cms.heroDescription)
      ? cms.heroDescription
      : fallback.heroDescription || cms.heroDescription,
    ctaLabel: hasArabic(cms.ctaLabel) ? cms.ctaLabel : fallback.ctaLabel || cms.ctaLabel,
    image: cms.image || fallback.image,
    features: pickSection(cms.features, fallback.features),
    benefits: pickSection(cms.benefits, fallback.benefits),
    useCases: pickSection(cms.useCases, fallback.useCases),
    impact:
      hasArabic(cms.impact.heading) || hasArabic(cms.impact.text) ? cms.impact : fallback.impact,
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
    if (!mapped) return fallback
    if (locale === 'ar' && fallback) return mergeLocalizedPage(mapped, fallback)
    return mapped
  } catch {
    return fallback
  } finally {
    clearTimeout(timer)
  }
}
