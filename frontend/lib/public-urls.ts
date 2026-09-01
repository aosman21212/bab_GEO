import { getPathname } from '@/i18n/navigation'
import { withBasePath } from '@/lib/base-path'

export function cmsPublicPagePath(locale: 'en' | 'ar', slug: string) {
  return withBasePath(getPathname({ locale, href: `/${slug}` }))
}
