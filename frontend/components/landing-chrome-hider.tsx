'use client'

import { useEffect } from 'react'

/** Hides main site header/footer so landing pages use their own slim chrome. */
export function LandingChromeHider() {
  useEffect(() => {
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    header?.classList.add('hidden')
    footer?.classList.add('hidden')
    return () => {
      header?.classList.remove('hidden')
      footer?.classList.remove('hidden')
    }
  }, [])
  return null
}
