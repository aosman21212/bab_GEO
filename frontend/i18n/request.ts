import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import en from '../messages/en.json'
import ar from '../messages/ar.json'
import { fetchSiteContent } from '../lib/api'

const catalogs = { en, ar } as const

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge<T extends Record<string, unknown>>(base: T, overlay: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(overlay)) {
    if (isObject(value) && isObject(out[key])) {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value)
    } else {
      out[key] = value
    }
  }
  return out as T
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'en' | 'ar')) {
    locale = routing.defaultLocale
  }

  const fallback = catalogs[locale as keyof typeof catalogs] as Record<string, unknown>
  const remote = await fetchSiteContent(locale)
  const messages = remote ? deepMerge(fallback, remote) : fallback

  return {
    locale,
    messages,
  }
})
