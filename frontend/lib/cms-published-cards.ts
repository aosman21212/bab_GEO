import { getApiUrl } from '@/lib/api'
import { normalizePageCategory, type PageCategory } from '@/lib/page-categories'
import type { Locale } from '@/i18n/routing'

export type PublishedCard = {
  slug: string
  title: string
  eyebrow: string
  summary: string
  image: string
}

type PublishedMeta = {
  slug: string
  category?: string
  titleEn?: string
  titleAr?: string
  title?: string
  image?: string
  imageEn?: string
  imageAr?: string
  eyebrowEn?: string
  eyebrowAr?: string
  summaryEn?: string
  summaryAr?: string
}

/** Shared published-pages listing mapped to cards for one CMS category. */
export async function fetchPublishedCards(
  locale: Locale,
  category: Extract<PageCategory, 'article' | 'case-study'>,
  timeoutMs = 4000,
): Promise<PublishedCard[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${getApiUrl()}/api/pages/meta/published`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const pages = (await res.json()) as PublishedMeta[]
    if (!Array.isArray(pages)) return []

    return pages
      .filter((p) => p?.slug && normalizePageCategory(p.category) === category)
      .map((p) => {
        const isAr = locale === 'ar'
        return {
          slug: p.slug,
          title: String(isAr ? p.titleAr || p.titleEn || p.title : p.titleEn || p.title || p.slug),
          eyebrow: String(isAr ? p.eyebrowAr || p.eyebrowEn : p.eyebrowEn || p.eyebrowAr || ''),
          summary: String(isAr ? p.summaryAr || p.summaryEn : p.summaryEn || p.summaryAr || ''),
          image: String(
            (isAr ? p.imageAr || p.imageEn : p.imageEn || p.imageAr) || p.image || '/images/bab-hero.png',
          ),
        }
      })
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
