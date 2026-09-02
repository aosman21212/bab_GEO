type GtagParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (command: 'event' | 'config' | 'js', ...args: unknown[]) => void
    __gaConfigured?: boolean
  }
}

export function getGaMeasurementId() {
  return process.env.GA_MEASUREMENT_ID?.trim() || ''
}

const DEFAULT_LEAD_CURRENCY = 'SAR'
const DEFAULT_LEAD_VALUE = 1

export function getGaLeadConfig() {
  const value = Number(process.env.GA_LEAD_VALUE)
  return {
    currency: process.env.GA_LEAD_CURRENCY?.trim() || DEFAULT_LEAD_CURRENCY,
    value: Number.isFinite(value) && value > 0 ? value : DEFAULT_LEAD_VALUE,
  }
}

export type GenerateLeadParams = {
  sourceSlug?: string
  locale: string
  formName: string
  method?: 'form' | 'whatsapp'
  currency?: string
  value?: number
}

export type BookDemoClickParams = {
  buttonLocation: string
  locale: string
  method?: 'form' | 'whatsapp'
  sourceSlug?: string
}

/** Tracks Book a demo button clicks across the site */
export function trackBookDemoClick(params: BookDemoClickParams) {
  trackEventWhenReady('book_demo_click', {
    button_location: params.buttonLocation,
    method: params.method || 'whatsapp',
    locale: params.locale,
    ...(params.sourceSlug ? { source_slug: params.sourceSlug } : {}),
  })
}

/** GA4 recommended event — populates Reports → Generate leads / Lead acquisition */
export function trackGenerateLead(params: GenerateLeadParams) {
  trackEventWhenReady('generate_lead', {
    currency: params.currency || DEFAULT_LEAD_CURRENCY,
    value: params.value ?? DEFAULT_LEAD_VALUE,
    lead_source: params.sourceSlug || 'website',
    form_name: params.formName,
    method: params.method || 'form',
    locale: params.locale,
    ...(params.sourceSlug ? { source_slug: params.sourceSlug } : {}),
  })
}

export function trackEvent(name: string, params?: GtagParams) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}

export function trackEventWhenReady(name: string, params?: GtagParams, attempts = 30) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    trackEvent(name, params)
    return
  }
  if (attempts <= 0) return
  window.setTimeout(() => trackEventWhenReady(name, params, attempts - 1), 100)
}
