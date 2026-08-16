import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createNextIntlPlugin from 'next-intl/plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return rules
  },
}

export default withNextIntl(nextConfig)
