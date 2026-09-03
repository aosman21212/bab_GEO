export const PAGE_CATEGORIES = [
  'home',
  'solution',
  'industry',
  'product',
  'case-study',
  'article',
  'landing',
] as const

export type PageCategory = (typeof PAGE_CATEGORIES)[number]

export const CREATABLE_PAGE_CATEGORIES = [
  'solution',
  'industry',
  'product',
  'case-study',
  'article',
  'landing',
] as const

export type CreatablePageCategory = (typeof CREATABLE_PAGE_CATEGORIES)[number]

export const HOME_PAGE_SLUG = 'home'

export const LANDING_TYPES = ['lead-form', 'whatsapp'] as const
export type LandingType = (typeof LANDING_TYPES)[number]

export function isPageCategory(value: unknown): value is PageCategory {
  return typeof value === 'string' && (PAGE_CATEGORIES as readonly string[]).includes(value)
}

export function normalizePageCategory(value: unknown): PageCategory {
  return isPageCategory(value) ? value : 'solution'
}

export function isHomePage(slug: string, category?: string) {
  return slug === HOME_PAGE_SLUG || category === 'home'
}

/** Admin i18n key under `admin.common.*` */
export function categoryCommonKey(
  category: PageCategory,
): 'home' | 'solution' | 'industry' | 'product' | 'caseStudy' | 'article' | 'landing' {
  if (category === 'case-study') return 'caseStudy'
  return category
}
