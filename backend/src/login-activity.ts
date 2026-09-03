import type { Request } from 'express'
import { LoginActivity } from './models.js'

function isPrivateIp(ip: string): boolean {
  const v = ip.replace(/^::ffff:/, '')
  if (v === '::1' || v === '127.0.0.1' || v === 'localhost') return true
  if (/^10\./.test(v)) return true
  if (/^192\.168\./.test(v)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true
  return false
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || ''
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || ''
  }
  return (req.ip || req.socket.remoteAddress || '').replace(/^::ffff:/, '')
}

async function lookupGeo(ip: string): Promise<{ city: string; country: string }> {
  if (!ip || isPrivateIp(ip)) return { city: '', country: '' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2000)
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return { city: '', country: '' }
    const data = (await res.json()) as {
      city?: string
      country_name?: string
      error?: boolean
    }
    if (data.error) return { city: '', country: '' }
    return {
      city: typeof data.city === 'string' ? data.city : '',
      country: typeof data.country_name === 'string' ? data.country_name : '',
    }
  } catch {
    return { city: '', country: '' }
  } finally {
    clearTimeout(timer)
  }
}

export async function recordLoginActivity(opts: {
  userId: string
  email: string
  req: Request
}): Promise<void> {
  const ip = clientIpFromRequest(opts.req)
  const userAgent = String(opts.req.headers['user-agent'] || '').slice(0, 500)
  const geo = await lookupGeo(ip)

  await LoginActivity.create({
    userId: opts.userId,
    email: opts.email,
    ip,
    userAgent,
    city: geo.city,
    country: geo.country,
  })
}
