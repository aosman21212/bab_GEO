import { getPathname } from '@/i18n/navigation'

export function cmsPublicPagePath(locale: 'en' | 'ar', slug: string) {
  return getPathname({ locale, href: `/${slug}` })
}
