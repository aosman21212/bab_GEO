'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!measurementId) return
    if (isLocalHost(window.location.hostname)) return
    setEnabled(true)
  }, [measurementId])

  if (!measurementId || !enabled) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          if (!window.__gaConfigured) {
            window.__gaConfigured = true;
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              send_page_view: true,
              cookie_domain: window.location.hostname,
              cookie_flags: location.protocol === 'https:' ? 'SameSite=Lax;Secure' : 'SameSite=Lax'
            });
          }
        `}
      </Script>
    </>
  )
}
