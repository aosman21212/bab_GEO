import { withBasePath } from '@/lib/base-path'

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function hostnameOf(raw: string | undefined) {
  if (!raw?.trim()) return ''
  try {
    return new URL(raw).hostname
  } catch {
    return ''
  }
}

/**
 * Server-side API base URL. Prefer API_URL (Docker: http://backend:4001).
 * Avoid falling back to localhost when the public site URL is a real host.
 */
export function getApiUrl() {
  const explicit = process.env.API_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const publicUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001').replace(/\/$/, '')

  if (typeof window === 'undefined') {
    const apiHost = hostnameOf(publicUrl)
    const siteHost =
      hostnameOf(process.env.SITE_URL) || hostnameOf(process.env.NEXT_PUBLIC_SITE_URL)
    if (apiHost && isLocalHostname(apiHost) && siteHost && !isLocalHostname(siteHost)) {
      console.error(
        `[api] NEXT_PUBLIC_API_URL points at ${apiHost} but site is ${siteHost}; using http://backend:4001. Set API_URL explicitly.`,
      )
      return 'http://backend:4001'
    }
  }

  return publicUrl
}

/**
 * Every host the Express API may answer on, in priority order. Covers both topologies:
 * all services in one Compose network (`backend`), and Express on the host with Next.js
 * in a container (`host.docker.internal`, the default bridge gateway `172.17.0.1`).
 */
export function backendCandidateUrls() {
  return [
    getApiUrl().replace(/\/$/, ''),
    'http://127.0.0.1:4001',
    'http://localhost:4001',
    'http://backend:4001',
    'http://host.docker.internal:4001',
    'http://172.17.0.1:4001',
  ].filter((url, index, self) => self.indexOf(url) === index)
}

/** Node surfaces the real network failure on `cause.code`; fetch itself only throws a generic TypeError. */
export function backendErrorCode(err: unknown) {
  const cause = (err as { cause?: { code?: string } })?.cause
  return cause?.code || (err as { code?: string })?.code || 'UNKNOWN'
}

const HEALTH_PROBE_TIMEOUT_MS = 2000

/**
 * Bounded, side-effect-free reachability check. A dead host can otherwise burn undici's
 * 10s connect timeout, and aborting `/api/health` is safe in a way aborting the real
 * request would not be (a login POST may already have sent its MFA email).
 */
async function backendHostAnswers(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_PROBE_TIMEOUT_MS),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Executes a fetch request to the Express backend with automatic host fallback.
 * Tries the primary URL from `getApiUrl()` first. If that fails to connect
 * (e.g. ENOTFOUND backend, ECONNREFUSED), the remaining candidates are health-probed
 * concurrently and the request is replayed against the first one that answers.
 */
export async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  const [primary, ...fallbacks] = backendCandidateUrls()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  try {
    return await fetch(`${primary}${normalizedPath}`, init)
  } catch (err) {
    if (init?.signal?.aborted) throw err
    console.warn(
      `[api] fetchBackend primary host failed (${primary}${normalizedPath}) ${backendErrorCode(err)}:`,
      (err as Error)?.message || err,
    )

    const probes = await Promise.all(
      fallbacks.map(async (baseUrl) => ({ baseUrl, answers: await backendHostAnswers(baseUrl) })),
    )
    const alive = probes.find((probe) => probe.answers)
    if (!alive) {
      console.error(
        `[api] fetchBackend found no reachable backend host for ${normalizedPath}; tried ${[primary, ...fallbacks].join(', ')}`,
      )
      throw err
    }

    console.warn(`[api] fetchBackend falling back to ${alive.baseUrl}. Set API_URL to this host.`)
    return fetch(`${alive.baseUrl}${normalizedPath}`, init)
  }
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
