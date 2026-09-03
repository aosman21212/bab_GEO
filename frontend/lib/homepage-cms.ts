import enMessages from '../messages/en.json'
import arMessages from '../messages/ar.json'
import { getApiUrl } from '@/lib/api'
import { HOME_PAGE_SLUG } from '@/lib/page-categories'
import {
  buildHomepageLocaleFromMessages,
  mergeHomepageLocale,
  type HomepageLocaleData,
} from '@/lib/homepage-content'

export function defaultHomepageLocale(locale: 'en' | 'ar'): HomepageLocaleData {
  return buildHomepageLocaleFromMessages(
    (locale === 'ar' ? arMessages : enMessages) as Record<string, unknown>,
    locale,
  )
}

export function homepageLocaleFromApi(raw: unknown, locale: 'en' | 'ar'): HomepageLocaleData {
  return mergeHomepageLocale(defaultHomepageLocale(locale), raw)
}

export async function fetchHomepageContent(
  locale: 'en' | 'ar',
  timeoutMs = 4000,
): Promise<HomepageLocaleData> {
  const fallback = defaultHomepageLocale(locale)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${getApiUrl()}/api/pages/${HOME_PAGE_SLUG}?locale=${locale}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    })
    if (!res.ok) return fallback
    const raw = (await res.json()) as Record<string, unknown>
    if (raw.status === 'draft') return fallback
    return mergeHomepageLocale(fallback, raw)
  } catch {
    return fallback
  } finally {
    clearTimeout(timer)
  }
}
