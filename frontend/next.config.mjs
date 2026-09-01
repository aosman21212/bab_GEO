import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createNextIntlPlugin from 'next-intl/plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  output: 'standalone',
  async redirects() {
    return [
      ...(basePath
        ? [{ source: '/', destination: basePath, permanent: false, basePath: false }]
        : []),
      { source: '/ar/admin', destination: '/admin', permanent: false },
      { source: '/en/admin', destination: '/admin', permanent: false },
      { source: '/ar/admin/:path*', destination: '/admin/:path*', permanent: false },
      { source: '/en/admin/:path*', destination: '/admin/:path*', permanent: false },
    ]
  },
  async rewrites() {
    const rules = [
      {
        source: '/uploads/:path*',
        destination: '/api/files/:path*',
      },
    ]
    const key = process.env.INDEXNOW_KEY
    if (key) {
      rules.push({
        source: `/${key}.txt`,
        destination: '/api/indexnow-key',
      })
    }
    const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()
    if (googleVerification) {
      rules.push({
        source: `/${googleVerification}.html`,
        destination: '/api/google-site-verification',
      })
    }
    return rules
  },
}

export default withNextIntl(nextConfig)
