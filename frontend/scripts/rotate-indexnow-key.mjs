#!/usr/bin/env node
/**
 * Generate or set IndexNow API key and write public/{key}.txt ownership file.
 *
 * Usage:
 *   npm run seo:rotate-indexnow-key
 *   npm run seo:rotate-indexnow-key -- --key=<bing-key>
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const argKey = process.argv.find((a) => a.startsWith('--key='))?.slice('--key='.length)
const key = (argKey || crypto.randomUUID().replace(/-/g, '')).trim()

if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
  console.error('Invalid key. Use 8–128 alphanumeric characters (and optional hyphens).')
  process.exit(1)
}

const publicDir = path.join(root, 'public')
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

// Remove previous key files that look like IndexNow keys (32+ hex)
for (const name of fs.readdirSync(publicDir)) {
  if (/^[a-f0-9-]{16,}\.txt$/i.test(name)) {
    fs.unlinkSync(path.join(publicDir, name))
  }
}

const keyFile = path.join(publicDir, `${key}.txt`)
fs.writeFileSync(keyFile, key, 'utf8')
console.log(`Wrote ${path.relative(root, keyFile)}`)

function upsertEnv(filePath) {
  let text = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
  if (/^INDEXNOW_KEY=/m.test(text)) {
    text = text.replace(/^INDEXNOW_KEY=.*$/m, `INDEXNOW_KEY=${key}`)
  } else {
    text = `${text.trimEnd()}\nINDEXNOW_KEY=${key}\n`
  }
  if (!/^NEXT_PUBLIC_SITE_URL=/m.test(text)) {
    text = `${text.trimEnd()}\nNEXT_PUBLIC_SITE_URL=https://bab.com.sa\n`
  }
  fs.writeFileSync(filePath, text, 'utf8')
  console.log(`Updated ${path.relative(root, filePath)}`)
}

upsertEnv(path.join(root, '.env.local'))

const examplePath = path.join(root, '.env.example')
if (fs.existsSync(examplePath)) {
  let example = fs.readFileSync(examplePath, 'utf8')
  if (!/^INDEXNOW_KEY=/m.test(example)) {
    example = `${example.trimEnd()}\nINDEXNOW_KEY=\n`
    fs.writeFileSync(examplePath, example, 'utf8')
  }
  if (!/^NEXT_PUBLIC_SITE_URL=/m.test(example)) {
    example = fs.readFileSync(examplePath, 'utf8')
    example = `${example.trimEnd()}\nNEXT_PUBLIC_SITE_URL=https://bab.com.sa\n`
    fs.writeFileSync(examplePath, example, 'utf8')
  }
}

console.log(`
Next steps:
1. Deploy so https://YOUR_DOMAIN/${key}.txt is publicly reachable
2. In Bing Webmaster Tools: IndexNow → use this key (or paste Bing-generated key with --key=)
3. Run: npm run seo:submit-indexnow
`)
