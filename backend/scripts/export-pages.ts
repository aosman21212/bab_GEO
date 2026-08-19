import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { allPages } from '../../frontend/lib/site-content.ts'
import { arPageOverlays } from '../../frontend/lib/ar-page-overlays.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const out = allPages.map((p) => {
  const { slug, category, ...en } = p
  return { slug, category, locales: { en, ar: arPageOverlays[slug] || {} } }
})

const dir = path.join(__dirname, '../seed-data')
fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(path.join(dir, 'pages.json'), JSON.stringify(out, null, 2))
console.log('wrote', out.length, 'pages to', path.join(dir, 'pages.json'))
