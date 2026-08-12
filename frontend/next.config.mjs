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
    const key = process.env.INDEXNOW_KEY
    if (!key) return []
    return [
      {
        source: `/${key}.txt`,
        destination: '/api/indexnow-key',
      },
    ]
  },
}

export default withNextIntl(nextConfig)
