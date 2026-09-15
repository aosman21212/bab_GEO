import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found | BAB',
  description:
    'This BAB page is not available. Return home for omnichannel, contact-center, and AI solutions in Saudi Arabia, or use the sitemap to find a published page.',
  robots: { index: false, follow: false },
}

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'sans-serif' }}>
          <p style={{ fontWeight: 700, letterSpacing: '0.12em' }}>404</p>
          <h1>Page not found</h1>
          <p>This page is not available.</p>
          <a href="/">Back to home</a>
        </main>
      </body>
    </html>
  )
}
