#!/usr/bin/env node
/**
 * HTTP smoke test for all public, GEO, and admin pages.
 * Usage: npm run smoke
 *        BASE_URL=http://localhost:3003 API_URL=http://localhost:4001 node scripts/smoke-pages.mjs
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3003').replace(/\/$/, '')
const API_URL = (process.env.API_URL || 'http://localhost:4001').replace(/\/$/, '')

const STATIC_PATHS = [
  '',
  'about-us',
  'success-stories',
  'articles',
  'careers',
  'contact-us',
  'privacy-policy',
  'terms-conditions',
  'sitemap',
]

const CMS_SLUGS = [
  'omnichannel',
  'live-engagement-platform',
  'rich-communication-services',
  'social-media-messaging-integration',
  'digital-transformation',
  'voice-bot',
  'ai-solution',
  'call-center',
  'healthcare-solutions',
  'food-and-beverage',
  'government-public-sector',
  'insurance-bpo-solutions',
  'retail-support-solutions',
]

const GEO_ROUTES = [
  '/llms.txt',
  '/llms-full.txt',
  '/llms-small.txt',
  '/robots.txt',
  '/sitemap.xml',
  '/.well-known/ai.txt',
  '/googled43fdb9897d9f8a7.html',
  '/BingSiteAuth.xml',
  '/877C499DA34F5945E4D93D5E4A752DA4.txt',
]

/** Optional GEO routes — 200 when configured. */
const OPTIONAL_GEO_ROUTES = []

const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/settings',
  '/admin/users',
  '/admin/geo',
  '/admin/library',
  '/admin/library/new',
  '/admin/library/omnichannel',
  '/admin/partners',
  '/admin/jobs',
  '/admin/applications',
  '/admin/inquiries',
  '/admin/content',
]

/** Paths that may legitimately redirect (locale prefix normalization, admin aliases). */
const ALLOW_REDIRECT = new Set(['/en', '/en/', '/admin/content'])

function localePath(locale, path) {
  if (locale === 'en') return path ? `/${path}` : '/'
  return path ? `/ar/${path}` : '/ar'
}

function buildPublicPaths() {
  const paths = []
  for (const locale of ['en', 'ar']) {
    for (const p of STATIC_PATHS) {
      paths.push({ group: 'static', path: localePath(locale, p) })
    }
    for (const slug of CMS_SLUGS) {
      paths.push({ group: 'cms', path: localePath(locale, slug) })
    }
  }
  return paths
}

async function fetchPage(url, { allowRedirect = false } = {}) {
  try {
    const res = await fetch(url, { redirect: allowRedirect ? 'follow' : 'manual' })
    const ok =
      res.status === 200 ||
      (allowRedirect && (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308))
    return { ok, status: res.status, url }
  } catch (err) {
    return { ok: false, status: 0, url, error: err.message }
  }
}

async function testFrontend(path, group, { optional = false } = {}) {
  const url = `${BASE_URL}${path}`
  const allowRedirect = ALLOW_REDIRECT.has(path)
  const result = await fetchPage(url, { allowRedirect })
  const ok = result.ok || (optional && result.status === 404)
  return { ...result, ok, path, group }
}

async function testApi(name, fn) {
  try {
    const detail = await fn()
    return { ok: true, name, detail }
  } catch (err) {
    return { ok: false, name, detail: err.message }
  }
}

async function main() {
  console.log(`Smoke test — BASE_URL=${BASE_URL}  API_URL=${API_URL}\n`)

  const results = []

  // Infrastructure
  const health = await fetchPage(`${API_URL}/api/health`)
  results.push({ group: 'infra', path: '/api/health', ...health, url: `${API_URL}/api/health` })
  results.push(await testFrontend('/', 'infra'))
  results.push(await testFrontend('/ar', 'infra'))

  // Public pages
  for (const { path, group } of buildPublicPaths()) {
    results.push(await testFrontend(path, group))
  }

  // GEO routes
  for (const route of GEO_ROUTES) {
    results.push(await testFrontend(route, 'geo'))
  }
  for (const route of OPTIONAL_GEO_ROUTES) {
    results.push(await testFrontend(route, 'geo', { optional: true }))
  }

  // Admin routes
  for (const route of ADMIN_ROUTES) {
    results.push(await testFrontend(route, 'admin'))
  }

  // API checks
  const apiResults = []

  apiResults.push(
    await testApi('GET /api/pages/meta/published', async () => {
      const res = await fetch(`${API_URL}/api/pages/meta/published`)
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('not an array')
      return `count=${data.length}`
    }),
  )

  apiResults.push(
    await testApi('GET /api/partners', async () => {
      const res = await fetch(`${API_URL}/api/partners`)
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      return `count=${Array.isArray(data) ? data.length : 'n/a'}`
    }),
  )

  apiResults.push(
    await testApi('GET /api/testimonials', async () => {
      const res = await fetch(`${API_URL}/api/testimonials`)
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      return `count=${Array.isArray(data) ? data.length : 'n/a'}`
    }),
  )

  apiResults.push(
    await testApi('POST /api/auth/login', async () => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bab.com.sa', password: 'Admin123!' }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      if (!data.token) throw new Error('no token')
      return `role=${data.user?.role || 'unknown'}`
    }),
  )

  // Report
  const passed = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)
  const apiPassed = apiResults.filter((r) => r.ok)
  const apiFailed = apiResults.filter((r) => !r.ok)

  const byGroup = {}
  for (const r of results) {
    const g = r.group || 'other'
    byGroup[g] = byGroup[g] || { pass: 0, fail: 0 }
    if (r.ok) byGroup[g].pass++
    else byGroup[g].fail++
  }

  console.log('--- Page results by group ---')
  for (const [g, counts] of Object.entries(byGroup)) {
    console.log(`  ${g}: ${counts.pass} pass, ${counts.fail} fail`)
  }
  console.log(`\nPages: ${passed.length}/${results.length} PASS`)

  if (failed.length) {
    console.log('\n--- FAILURES ---')
    for (const f of failed) {
      console.log(`  FAIL ${f.status} ${f.path || f.url}${f.error ? ` (${f.error})` : ''}`)
    }
  }

  console.log('\n--- API results ---')
  for (const r of apiResults) {
    console.log(`  ${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.detail ? ` :: ${r.detail}` : ''}`)
  }
  console.log(`\nAPIs: ${apiPassed.length}/${apiResults.length} PASS`)

  const totalFail = failed.length + apiFailed.length
  console.log(`\n${totalFail === 0 ? 'ALL PASS' : `TOTAL FAILURES: ${totalFail}`}`)
  process.exit(totalFail > 0 ? 1 : 0)
}

main()
