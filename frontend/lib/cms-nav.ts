import { solutionGroups } from '@/lib/nav-tree'
import { normalizePageCategory, type PageCategory } from '@/lib/page-categories'
import { withBasePath } from '@/lib/base-path'

export type CmsNavLink = {
  href: string
  label: string
  category: PageCategory
}

export type CmsNavExtras = {
  solutions: CmsNavLink[]
  industries: CmsNavLink[]
  products: CmsNavLink[]
  caseStudies: CmsNavLink[]
  articles: CmsNavLink[]
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
  return { solutions: [], industries: [], products: [], caseStudies: [], articles: [] }
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
    const category = normalizePageCategory(page.category)
    const link: CmsNavLink = {
      href: `/${page.slug}`,
      label,
      category,
    }
    if (category === 'industry') extras.industries.push(link)
    else if (category === 'product') extras.products.push(link)
    else if (category === 'case-study') extras.caseStudies.push(link)
    else if (category === 'article') extras.articles.push(link)
    else if (category === 'landing') continue
    else extras.solutions.push(link)
  }
  return extras
}

/** Browser-safe fetch via Next same-origin proxy (avoids CORS to :4001). */
export async function fetchCmsNavExtras(locale: string): Promise<CmsNavExtras> {
  try {
    const res = await fetch(withBasePath('/api/cms/published-pages'), {
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
