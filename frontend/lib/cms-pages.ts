import type { Locale } from '@/i18n/routing'
import type { PageContent } from '@/lib/site-content'
import { getLocalizedPage } from '@/lib/localized-content'
import { getApiUrl } from '@/lib/api'
import { HOME_PAGE_SLUG } from '@/lib/page-categories'

const arabicRe = /[\u0600-\u06FF]/

function hasArabic(value: unknown): boolean {
  return typeof value === 'string' && arabicRe.test(value)
}

function mapToPageContent(raw: Record<string, unknown>, slug: string): PageContent | null {
  if (raw.status === 'draft') return null
  if (slug === HOME_PAGE_SLUG || raw.category === 'home') return null

  const impact = (raw.impact as { heading?: string; text?: string } | undefined) ?? {
    heading: '',
    text: '',
  }

  const highlights = Array.isArray(raw.highlights)
    ? raw.highlights.map((h) => String(h)).filter(Boolean)
    : undefined

  const galleryImages = Array.isArray(raw.galleryImages)
    ? raw.galleryImages.map((h) => String(h)).filter(Boolean)
    : undefined

  return {
    slug,
    category: (raw.category as PageContent['category']) || 'solution',
    landingType: raw.landingType as PageContent['landingType'],
    metaTitle: String(raw.metaTitle ?? ''),
    metaDescription: String(raw.metaDescription ?? ''),
    eyebrow: String(raw.eyebrow ?? ''),
    heroHeading: String(raw.heroHeading ?? ''),
    heroDescription: String(raw.heroDescription ?? ''),
    ctaLabel: String(raw.ctaLabel ?? ''),
    image: String(raw.image ?? '/images/bab-hero.png'),
    galleryImages,
    highlights,
    formNote: String(raw.formNote ?? ''),
    whatsappDisplayName: String(raw.whatsappDisplayName ?? ''),
    whatsappPhone: String(raw.whatsappPhone ?? ''),
    officialWebsite: String(raw.officialWebsite ?? ''),
    officialEmail: String(raw.officialEmail ?? ''),
    profileDescription: String(raw.profileDescription ?? ''),
    features: raw.features as PageContent['features'],
    benefits: raw.benefits as PageContent['benefits'],
    useCases: raw.useCases as PageContent['useCases'],
    impact: {
      heading: String(impact.heading ?? ''),
      text: String(impact.text ?? ''),
    },
  }
}

function highlightsHaveArabic(highlights: string[] | undefined) {
  return Boolean(highlights?.some((item) => hasArabic(item)))
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
    galleryImages:
      cms.galleryImages && cms.galleryImages.length > 0
        ? cms.galleryImages
        : fallback.galleryImages ?? cms.galleryImages,
    highlights: highlightsHaveArabic(cms.highlights)
      ? cms.highlights
      : fallback.highlights ?? cms.highlights,
    formNote: hasArabic(cms.formNote) ? cms.formNote : fallback.formNote || cms.formNote,
    profileDescription: hasArabic(cms.profileDescription)
      ? cms.profileDescription
      : fallback.profileDescription || cms.profileDescription,
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
  if (slug === HOME_PAGE_SLUG) return undefined
  const fallback = getLocalizedPage(slug, locale)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${getApiUrl()}/api/pages/${encodeURIComponent(slug)}?locale=${locale}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    })

    // Missing CMS doc → use static catalog (empty DB / unpublished slug).
    // Intentional drafts still stay private when the API returns draft JSON.
    if (res.status === 404) return fallback
    if (!res.ok) return fallback

    const raw = (await res.json()) as Record<string, unknown>
    if (raw.status === 'draft') return undefined

    const mapped = mapToPageContent(raw, slug)
    if (!mapped) return fallback
    if (locale === 'ar' && fallback) return mergeLocalizedPage(mapped, fallback)
    if (locale === 'ar') return mapped
    return mapped
  } catch {
    return fallback
  } finally {
    clearTimeout(timer)
  }
}
