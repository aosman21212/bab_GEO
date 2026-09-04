#!/usr/bin/env node
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function resolveApiUrl() {
  const envUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  const candidates = [
    'http://localhost:4001',
    'http://127.0.0.1:4001',
    envUrl,
    'http://backend:4001',
  ].filter((url, idx, self) => Boolean(url) && self.indexOf(url) === idx)

  for (const candidate of candidates) {
    try {
      const res = await fetch(`${candidate}/api/health`)
      if (res.ok) {
        console.log(`[test] Connected to backend at: ${candidate}`)
        return candidate
      }
    } catch {
      /* ignore */
    }
  }
  return candidates[0] || 'http://localhost:4001'
}

const API_URL = await resolveApiUrl()
const JWT_SECRET = process.env.JWT_SECRET || 'bab-local-docker-jwt-secret-key-32c'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bab.com.sa'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

console.log(`Backend API Test Suite`)
console.log(`Target URL : ${API_URL}`)
console.log(`JWT Secret : ${JWT_SECRET ? '[Loaded]' : '[Missing]'}\n`)

function getCandidateSecrets() {
  return [
    process.env.JWT_SECRET,
    'bab-local-docker-jwt-secret-key-32c',
    'change-me-in-production-bab-cms',
    'dev-secret',
  ].filter((s, idx, self) => Boolean(s) && self.indexOf(s) === idx)
}

function generateAdminToken(secret, sub = '66f000000000000000000001') {
  return jwt.sign(
    {
      sub,
      email: ADMIN_EMAIL,
      role: 'admin',
      sid: 'test-session-id-' + Math.random().toString(36).slice(2),
      mfaVerified: true,
    },
    secret,
    { expiresIn: '20m' }
  )
}

async function resolveWorkingToken() {
  const secrets = getCandidateSecrets()
  for (const secret of secrets) {
    const t = generateAdminToken(secret)
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.ok) {
        const users = await res.json()
        const realSub = users?.[0]?._id || '66f000000000000000000001'
        console.log(`[test] Validated JWT secret against server (using user _id: ${realSub})`)
        return generateAdminToken(secret, realSub)
      }
    } catch {
      /* ignore */
    }
  }
  return generateAdminToken(secrets[0])
}

const token = await resolveWorkingToken()

const results = []

async function req(method, path, options = {}) {
  const url = `${API_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  }

  const init = {
    method,
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  }

  try {
    const res = await fetch(url, init)
    let json = null
    try {
      json = await res.json()
    } catch {
      /* non-json body */
    }
    return { status: res.status, ok: res.ok, body: json }
  } catch (err) {
    return { status: 0, ok: false, error: err.message }
  }
}

async function testEndpoint(name, expectedStatus, fn) {
  try {
    const res = await fn()
    const pass = Array.isArray(expectedStatus)
      ? expectedStatus.includes(res.status)
      : res.status === expectedStatus

    results.push({
      name,
      expected: expectedStatus,
      received: res.status,
      pass,
      error: res.error || (pass ? null : JSON.stringify(res.body)),
    })
    const symbol = pass ? '✓ PASS' : '✗ FAIL'
    console.log(`  ${symbol} [${res.status}] ${name}${!pass ? ` (Expected: ${expectedStatus})` : ''}`)
    return res
  } catch (err) {
    results.push({ name, expected: expectedStatus, received: 0, pass: false, error: err.message })
    console.log(`  ✗ FAIL [0] ${name} - ${err.message}`)
    return { status: 0, ok: false, error: err.message }
  }
}

async function runTests() {
  console.log('--- 1. Infrastructure & Public Endpoints ---')
  await testEndpoint('GET /api/health', 200, () => req('GET', '/api/health'))
  await testEndpoint('GET /api/content/en', 200, () => req('GET', '/api/content/en'))
  await testEndpoint('GET /api/content/ar', 200, () => req('GET', '/api/content/ar'))
  await testEndpoint('GET /api/partners', 200, () => req('GET', '/api/partners'))
  await testEndpoint('GET /api/testimonials', 200, () => req('GET', '/api/testimonials'))
  await testEndpoint('GET /api/jobs', 200, () => req('GET', '/api/jobs'))
  await testEndpoint('GET /api/pages/meta/published', 200, () => req('GET', '/api/pages/meta/published'))
  await testEndpoint('GET /api/pages/omnichannel', [200, 404], () => req('GET', '/api/pages/omnichannel'))

  console.log('\n--- 2. Unauthenticated 401 Protections ---')
  await testEndpoint('GET /api/auth/me (No token)', 401, () => req('GET', '/api/auth/me'))
  await testEndpoint('GET /api/users (No token)', 401, () => req('GET', '/api/users'))
  await testEndpoint('GET /api/users/activity (No token)', 401, () => req('GET', '/api/users/activity'))
  await testEndpoint('GET /api/partners/admin/all (No token)', 401, () => req('GET', '/api/partners/admin/all'))
  await testEndpoint('GET /api/testimonials/admin/all (No token)', 401, () => req('GET', '/api/testimonials/admin/all'))
  await testEndpoint('GET /api/pages (No token)', 401, () => req('GET', '/api/pages'))
  await testEndpoint('GET /api/inquiries (No token)', 401, () => req('GET', '/api/inquiries'))
  await testEndpoint('GET /api/jobs/admin/all (No token)', 401, () => req('GET', '/api/jobs/admin/all'))
  await testEndpoint('GET /api/job-applications (No token)', 401, () => req('GET', '/api/job-applications'))

  console.log('\n--- 3. Auth Flow Endpoints ---')
  await testEndpoint('POST /api/auth/login (Invalid Password)', 401, () =>
    req('POST', '/api/auth/login', { body: { email: ADMIN_EMAIL, password: 'WrongPassword999!' } })
  )
  await testEndpoint('POST /api/auth/login (Valid Credentials)', 200, () =>
    req('POST', '/api/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  )

  console.log('\n--- 4. Authenticated Admin Operations ---')
  await testEndpoint('GET /api/auth/me (With JWT)', 200, () => req('GET', '/api/auth/me', { token }))
  await testEndpoint('GET /api/users (With JWT)', 200, () => req('GET', '/api/users', { token }))
  await testEndpoint('GET /api/users/activity (With JWT)', 200, () => req('GET', '/api/users/activity', { token }))
  await testEndpoint('GET /api/content/admin/en (With JWT)', 200, () => req('GET', '/api/content/admin/en', { token }))

  // Content update test
  await testEndpoint('PUT /api/content/en/test_suite_key', 200, () =>
    req('PUT', '/api/content/en/test_suite_key', { token, body: { data: { test: true } } })
  )

  // Partners CRUD
  let createdPartnerId = null
  const partnerRes = await testEndpoint('POST /api/partners', 201, () =>
    req('POST', '/api/partners', {
      token,
      body: { slug: 'test-partner-' + Date.now(), name: 'Test Partner', logoUrl: '/images/test.png' },
    })
  )
  if (partnerRes.body?._id) createdPartnerId = partnerRes.body._id

  await testEndpoint('GET /api/partners/admin/all (With JWT)', 200, () => req('GET', '/api/partners/admin/all', { token }))

  if (createdPartnerId) {
    await testEndpoint('PUT /api/partners/:id', 200, () =>
      req('PUT', `/api/partners/${createdPartnerId}`, { token, body: { name: 'Updated Partner' } })
    )
    await testEndpoint('DELETE /api/partners/:id', 200, () =>
      req('DELETE', `/api/partners/${createdPartnerId}`, { token })
    )
  }

  // Testimonials CRUD
  let createdTestimonialId = null
  const testimonialRes = await testEndpoint('POST /api/testimonials', 201, () =>
    req('POST', '/api/testimonials', {
      token,
      body: { name: 'Test User', quote: 'Great service!', logoUrl: '/images/test.png' },
    })
  )
  if (testimonialRes.body?._id) createdTestimonialId = testimonialRes.body._id

  await testEndpoint('GET /api/testimonials/admin/all (With JWT)', 200, () => req('GET', '/api/testimonials/admin/all', { token }))

  if (createdTestimonialId) {
    await testEndpoint('PUT /api/testimonials/:id', 200, () =>
      req('PUT', `/api/testimonials/${createdTestimonialId}`, { token, body: { quote: 'Updated quote' } })
    )
    await testEndpoint('DELETE /api/testimonials/:id', 200, () =>
      req('DELETE', `/api/testimonials/${createdTestimonialId}`, { token })
    )
  }

  // Pages CRUD
  await testEndpoint('GET /api/pages (With JWT)', 200, () => req('GET', '/api/pages', { token }))
  await testEndpoint('GET /api/pages/by-id/omnichannel', [200, 404], () => req('GET', '/api/pages/by-id/omnichannel', { token }))

  const testSlug = 'test-page-' + Math.random().toString(36).slice(2, 8)
  const pageRes = await testEndpoint('POST /api/pages', 201, () =>
    req('POST', '/api/pages', {
      token,
      body: {
        slug: testSlug,
        category: 'solution',
        locales: { en: { heroHeading: 'Test Solution' } },
      },
    })
  )

  if (pageRes.status === 201) {
    await testEndpoint('PUT /api/pages/:slug', 200, () =>
      req('PUT', `/api/pages/${testSlug}`, {
        token,
        body: { status: 'published' },
      })
    )
    await testEndpoint('DELETE /api/pages/:slug', 200, () =>
      req('DELETE', `/api/pages/${testSlug}`, { token })
    )
  }

  // Inquiries
  let createdInquiryId = null
  const inquiryRes = await testEndpoint('POST /api/inquiries (Public Submit)', 201, () =>
    req('POST', '/api/inquiries', {
      body: {
        name: 'Test Lead',
        email: 'testlead@example.com',
        phone: '+966500000000',
        project: 'Testing backend endpoints',
      },
    })
  )
  if (inquiryRes.body?.id) createdInquiryId = inquiryRes.body.id

  await testEndpoint('GET /api/inquiries (With JWT)', 200, () => req('GET', '/api/inquiries', { token }))

  if (createdInquiryId) {
    await testEndpoint('PATCH /api/inquiries/:id', 200, () =>
      req('PATCH', `/api/inquiries/${createdInquiryId}`, { token, body: { status: 'read' } })
    )
  }

  // Jobs CRUD
  let createdJobId = null
  const jobSlug = 'test-job-' + Math.random().toString(36).slice(2, 8)
  const jobRes = await testEndpoint('POST /api/jobs', 201, () =>
    req('POST', '/api/jobs', {
      token,
      body: {
        slug: jobSlug,
        titleEn: 'Test Engineer',
        titleAr: 'مهندس اختبار',
        employmentType: 'full-time',
      },
    })
  )
  if (jobRes.body?._id) createdJobId = jobRes.body._id

  await testEndpoint('GET /api/jobs/admin/all (With JWT)', 200, () => req('GET', '/api/jobs/admin/all', { token }))

  if (createdJobId) {
    await testEndpoint('PUT /api/jobs/:id', 200, () =>
      req('PUT', `/api/jobs/${createdJobId}`, { token, body: { status: 'closed' } })
    )
    await testEndpoint('DELETE /api/jobs/:id', 200, () =>
      req('DELETE', `/api/jobs/${createdJobId}`, { token })
    )
  }

  // Job Applications
  await testEndpoint('GET /api/job-applications (With JWT)', 200, () => req('GET', '/api/job-applications', { token }))

  // Logout
  await testEndpoint('POST /api/auth/logout', 200, () => req('POST', '/api/auth/logout', { token }))

  // Summary
  const total = results.length
  const passed = results.filter((r) => r.pass).length
  const failed = results.filter((r) => !r.pass).length

  console.log('\n========================================')
  console.log(`Backend API Test Summary: ${passed}/${total} PASS`)
  if (failed > 0) {
    console.log(`FAILURES: ${failed}`)
    results
      .filter((r) => !r.pass)
      .forEach((r) => console.log(`  - ${r.name} (Status: ${r.received}, Expected: ${r.expected}) :: ${r.error}`))
  }
  console.log('========================================\n')

  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Fatal error running test suite:', err)
  process.exit(1)
})
