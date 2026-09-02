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
