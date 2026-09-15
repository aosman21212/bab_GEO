import { withBasePath } from '@/lib/base-path'

/**
 * Backend origin for server-side fetch.
 * Prefer API_URL (not inlined by Next) so Docker can use http://backend:4001 at runtime.
 * NEXT_PUBLIC_API_URL is the browser-facing fallback, baked in at build.
 */
export function getApiUrl() {
  const serverUrl = process.env.API_URL?.replace(/\/$/, '')
  if (serverUrl) return serverUrl
  return String(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
}

/** Node surfaces the real network failure on `cause.code`; fetch itself only throws a generic TypeError. */
export function backendErrorCode(err: unknown) {
  const cause = (err as { cause?: { code?: string } })?.cause
  return cause?.code || (err as { code?: string })?.code || 'UNKNOWN'
}

export async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return fetch(`${base}${normalizedPath}`, init)
}

async function apiFetch<T>(path: string, init?: RequestInit, timeoutMs = 4000): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchBackend(path, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      next: init?.cache === 'no-store' ? undefined : { revalidate: 60 },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export type ApiPartner = {
  _id?: string
  slug: string
  name?: string
  logoUrl: string
  websiteUrl?: string
  order: number
  active: boolean
}

export type ApiTestimonial = {
  _id?: string
  name: string
  role?: string
  quote: string
  logoUrl: string
  order: number
  active: boolean
}

export async function fetchSiteContent(locale: string) {
  return apiFetch<Record<string, unknown>>(`/api/content/${locale}`)
}

export async function fetchPartners() {
  return apiFetch<ApiPartner[]>('/api/partners')
}

export async function fetchTestimonials(locale?: string) {
  const q = locale ? `?locale=${locale}` : ''
  return apiFetch<ApiTestimonial[]>(`/api/testimonials${q}`)
}

export async function submitInquiry(body: {
  name: string
  company?: string
  phone: string
  email: string
  project: string
  locale?: 'en' | 'ar'
  sourceSlug?: string
}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(withBasePath('/api/inquiries'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false as const, error: (data as { error?: string }).error || 'Request failed' }
    }
    return { ok: true as const, id: (data as { id?: string }).id }
  } catch {
    return { ok: false as const, error: 'Network error' }
  } finally {
    clearTimeout(timer)
  }
}

export type ApiJob = {
  _id: string
  slug: string
  titleEn: string
  titleAr: string
  departmentEn?: string
  departmentAr?: string
  locationEn?: string
  locationAr?: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  descriptionEn?: string
  descriptionAr?: string
  status: 'open' | 'closed'
  order: number
}

export async function fetchOpenJobs() {
  return apiFetch<ApiJob[]>('/api/jobs')
}

export async function submitJobApplication(formData: FormData) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(withBasePath('/api/job-applications'), {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false as const, error: (data as { error?: string }).error || 'Request failed' }
    }
    return { ok: true as const, id: (data as { id?: string }).id }
  } catch {
    return { ok: false as const, error: 'Network error' }
  } finally {
    clearTimeout(timer)
  }
}
