import { getPathname } from '@/i18n/navigation'
import { withBasePath } from '@/lib/base-path'
import { HOME_PAGE_SLUG } from '@/lib/page-categories'

export function cmsPublicPagePath(locale: 'en' | 'ar', slug: string) {
  if (slug === HOME_PAGE_SLUG) {
    return withBasePath(getPathname({ locale, href: '/' }))
  }
  return withBasePath(getPathname({ locale, href: `/${slug}` }))
}
