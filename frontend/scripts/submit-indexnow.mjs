#!/usr/bin/env node
/**
 * Submit all sitemap URLs via IndexNow (Bing / Yandex / partners).
 * Same action as GEO → Submit sitemap (IndexNow).
 *
 * Usage: npm run seo:submit-indexnow
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const text = fs.readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(path.join(root, '.env.local'))
loadEnvFile(path.join(root, '.env'))

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')
const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bab.com.sa').replace(/\/$/, '')
const site =
  basePath && !origin.endsWith(basePath) ? `${origin}${basePath}` : origin
const key = process.env.INDEXNOW_KEY || ''

if (!key) {
  console.error('INDEXNOW_KEY is missing. Run: npm run seo:rotate-indexnow-key')
  process.exit(1)
}

const host = new URL(site).host

function locTags(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

function isSitemapFile(url) {
  return /\/sitemap(\/[^/]+)?\.xml$/i.test(url)
}

async function fetchXml(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.text()
}

/** HTML page URLs from the sitemap index (or a legacy urlset). */
async function urlsFromSitemap() {
  try {
    const indexXml = await fetchXml(`${site}/sitemap.xml`)
    if (!indexXml) return null
    const locs = locTags(indexXml)
    if (indexXml.includes('<sitemapindex')) {
      const pages = []
      for (const child of locs.filter(isSitemapFile)) {
        const childXml = await fetchXml(child)
        if (!childXml) continue
        pages.push(...locTags(childXml).filter((url) => !isSitemapFile(url)))
      }
      return pages.length ? Array.from(new Set(pages)) : null
    }
    const pages = locs.filter((url) => !isSitemapFile(url))
    return pages.length ? pages : null
  } catch {
    return null
  }
}

const fallback = [
  site,
  `${site}/ar`,
  `${site}/about-us`,
  `${site}/contact-us`,
]

const urlList = (await urlsFromSitemap()) || fallback

const payload = {
  host,
  key,
  keyLocation: `${site}/${key}.txt`,
  urlList,
}

const endpoints = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
]

console.log(`Submitting ${urlList.length} URLs for ${host}…`)

let ok = false
for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })
    console.log(`${url} → ${res.status}`)
    if (res.ok || res.status === 200 || res.status === 202) ok = true
  } catch (err) {
    console.log(`${url} → error:`, err.message)
  }
}

if (!ok) {
  console.error('All IndexNow endpoints failed. Check key file and Bing Webmaster verification.')
  process.exit(1)
}

console.log('Done.')
