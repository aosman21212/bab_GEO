'use client'

import { useEffect } from 'react'

/** Hides main site header/footer from the locale layout so landing pages use their own chrome. */
export function LandingChromeHider() {
  useEffect(() => {
    const header = document.querySelector('[data-site-chrome="header"]')
    const footer = document.querySelector('[data-site-chrome="footer"]')
    header?.classList.add('hidden')
    footer?.classList.add('hidden')
    return () => {
      header?.classList.remove('hidden')
      footer?.classList.remove('hidden')
    }
  }, [])
  return null
}
