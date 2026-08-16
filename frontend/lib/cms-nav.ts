import { solutionGroups } from '@/lib/nav-tree'

export type CmsNavLink = {
  href: string
  label: string
  category: 'solution' | 'industry'
}

export type CmsNavExtras = {
  solutions: CmsNavLink[]
  industries: CmsNavLink[]
}

type PublishedMeta = {
  slug: string
  category?: string
  title?: string
  titleEn?: string
  titleAr?: string
}

const staticSlugs = new Set(
  solutionGroups.flatMap((g) => g.items.map((item) => item.href.replace(/^\//, ''))),
)

export function emptyCmsNavExtras(): CmsNavExtras {
  return { solutions: [], industries: [] }
}

export function partitionCmsNavExtras(
  pages: PublishedMeta[],
  locale: string,
): CmsNavExtras {
  const extras = emptyCmsNavExtras()
  for (const page of pages) {
    if (!page?.slug || staticSlugs.has(page.slug)) continue
    const label =
      locale === 'ar'
        ? String(page.titleAr || page.titleEn || page.title || page.slug)
        : String(page.titleEn || page.title || page.slug)
    const link: CmsNavLink = {
      href: `/${page.slug}`,
      label,
      category: page.category === 'industry' ? 'industry' : 'solution',
    }
    if (link.category === 'industry') extras.industries.push(link)
    else extras.solutions.push(link)
  }
  return extras
}

/** Browser-safe fetch via Next same-origin proxy (avoids CORS to :4001). */
export async function fetchCmsNavExtras(locale: string): Promise<CmsNavExtras> {
  try {
    const res = await fetch('/api/cms/published-pages', {
      cache: 'no-store',
    })
    if (!res.ok) return emptyCmsNavExtras()
    const data = (await res.json()) as PublishedMeta[]
    if (!Array.isArray(data)) return emptyCmsNavExtras()
    return partitionCmsNavExtras(data, locale)
  } catch {
    return emptyCmsNavExtras()
  }
}
