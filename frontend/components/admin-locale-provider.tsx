'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import en from '@/messages/en.json'
import ar from '@/messages/ar.json'

export type AdminUiLocale = 'en' | 'ar'

const STORAGE_KEY = 'bab-admin-locale'
const COOKIE_KEY = 'bab-admin-locale'

type AdminMessages = typeof en.admin

const catalogs: Record<AdminUiLocale, AdminMessages> = {
  en: en.admin,
  ar: ar.admin,
}

type AdminLocaleContextValue = {
  uiLocale: AdminUiLocale
  setUiLocale: (locale: AdminUiLocale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null)

function readStoredLocale(): AdminUiLocale {
  if (typeof window === 'undefined') return 'en'
  try {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY)
    if (fromStorage === 'ar' || fromStorage === 'en') return fromStorage
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`))
  const fromCookie = match?.[1]
  if (fromCookie === 'ar' || fromCookie === 'en') return fromCookie
  return 'en'
}

function persistLocale(locale: AdminUiLocale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;SameSite=Lax`
}

function lookup(
  messages: AdminMessages,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split('.')
  let current: unknown = messages
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return key
    }
  }
  if (typeof current !== 'string') return key
  if (!vars) return current
  return current.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  )
}

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [uiLocale, setUiLocaleState] = useState<AdminUiLocale>('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const locale = readStoredLocale()
    setUiLocaleState(locale)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const dir = uiLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = uiLocale
    document.documentElement.dir = dir
  }, [uiLocale, ready])

  const setUiLocale = useCallback((locale: AdminUiLocale) => {
    setUiLocaleState(locale)
    persistLocale(locale)
  }, [])

  const value = useMemo<AdminLocaleContextValue>(() => {
    const messages = catalogs[uiLocale]
    return {
      uiLocale,
      setUiLocale,
      t: (key: string, vars?: Record<string, string | number>) =>
        lookup(messages, key, vars),
      dir: uiLocale === 'ar' ? 'rtl' : 'ltr',
    }
  }, [uiLocale, setUiLocale])

  return (
    <AdminLocaleContext.Provider value={value}>
      <div
        lang={uiLocale}
        dir={value.dir}
        className={uiLocale === 'ar' ? 'font-[family-name:var(--font-cairo)]' : undefined}
      >
        {children}
      </div>
    </AdminLocaleContext.Provider>
  )
}

export function useAdminLocale() {
  const ctx = useContext(AdminLocaleContext)
  if (!ctx) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider')
  }
  return ctx
}
