export const PAGE_CATEGORIES = [
  'solution',
  'industry',
  'product',
  'case-study',
  'article',
] as const

export type PageCategory = (typeof PAGE_CATEGORIES)[number]

export function isPageCategory(value: unknown): value is PageCategory {
  return typeof value === 'string' && (PAGE_CATEGORIES as readonly string[]).includes(value)
}

export function normalizePageCategory(value: unknown): PageCategory {
  return isPageCategory(value) ? value : 'solution'
}

/** Admin i18n key under `admin.common.*` */
export function categoryCommonKey(
  category: PageCategory,
): 'solution' | 'industry' | 'product' | 'caseStudy' | 'article' {
  if (category === 'case-study') return 'caseStudy'
  return category
}
