import { Redis } from 'ioredis'
import { env } from './config.js'

let redis: Redis | null = null
let redisAvailable = false

export function getRedis() {
  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy(times: number) {
        if (times > 3) return null
        return Math.min(times * 200, 1000)
      },
    })
    redis.on('error', (err: Error) => {
      if (redisAvailable) console.warn('[redis] error:', err.message)
      redisAvailable = false
    })
    redis.on('connect', () => {
      redisAvailable = true
      console.log('[redis] connected')
    })
    redis.on('end', () => {
      redisAvailable = false
    })
  }
  return redis
}

export async function ensureRedis() {
  const client = getRedis()
  try {
    if (client.status === 'wait') await client.connect()
    await client.ping()
    redisAvailable = true
    console.log('[redis] ready')
  } catch (err) {
    redisAvailable = false
    console.warn('[redis] unavailable — continuing without cache')
    try {
      client.disconnect()
    } catch {
      /* ignore */
    }
  }
}

const DEFAULT_TTL = 300

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisAvailable) return null
  try {
    const raw = await getRedis().get(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL) {
  if (!redisAvailable) return
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttl)
  } catch {
    /* ignore */
  }
}

export async function cacheDel(...keys: string[]) {
  if (!redisAvailable || keys.length === 0) return
  try {
    await getRedis().del(...keys)
  } catch {
    /* ignore */
  }
}

export async function cacheDelPattern(pattern: string) {
  if (!redisAvailable) return
  try {
    const client = getRedis()
    const stream = client.scanStream({ match: pattern, count: 100 })
    const pipeline = client.pipeline()
    let count = 0
    for await (const keys of stream) {
      for (const key of keys as string[]) {
        pipeline.del(key)
        count++
      }
    }
    if (count) await pipeline.exec()
  } catch {
    /* ignore */
  }
}

const SESSION_DENY_PREFIX = 'admin:deny:'
const SESSION_DENY_TTL = 20 * 60

function denyKey(sid: string) {
  return `${SESSION_DENY_PREFIX}${sid}`
}

/** Denylist an admin session id (logout / idle). No-op if Redis is down. */
export async function denySession(sid: string | undefined, ttlSeconds = SESSION_DENY_TTL) {
  if (!sid || !redisAvailable) return
  try {
    await getRedis().set(denyKey(sid), '1', 'EX', ttlSeconds)
  } catch {
    /* ignore */
  }
}

/** True if this session was logged out. Fail-open if Redis is down (JWT exp still applies). */
export async function isSessionDenied(sid: string | undefined) {
  if (!sid || !redisAvailable) return false
  try {
    const hit = await getRedis().get(denyKey(sid))
    return hit !== null
  } catch {
    return false
  }
}

/** Simple Redis rate limit: max N hits per windowSeconds for a key. */
export async function rateLimit(key: string, max: number, windowSeconds: number) {
  if (!redisAvailable) return { ok: true, remaining: max }
  try {
    const client = getRedis()
    const count = await client.incr(key)
    if (count === 1) await client.expire(key, windowSeconds)
    return { ok: count <= max, remaining: Math.max(0, max - count) }
  } catch {
    return { ok: true, remaining: max }
  }
}

export type MfaChallengeRecord = {
  challengeId: string
  userId: string
  email: string
  codeHmac: string
  attempts: number
  locked: boolean
  expiresAt: number // epoch ms
  resendCooldownUntil: number // epoch ms
}

export const MFA_CHALLENGE_TTL_SECONDS = 100 * 60 // 100 minutes
export const MFA_RESEND_COOLDOWN_SECONDS = 60 // 60 seconds
export const MFA_MAX_ATTEMPTS = 5

function mfaKey(challengeId: string) {
  return `admin:mfa:${challengeId}`
}

export async function storeMfaChallenge(record: MfaChallengeRecord): Promise<boolean> {
  if (!redisAvailable) return false
  try {
    await getRedis().set(
      mfaKey(record.challengeId),
      JSON.stringify(record),
      'EX',
      MFA_CHALLENGE_TTL_SECONDS,
    )
    return true
  } catch {
    return false
  }
}

export async function getMfaChallenge(
  challengeId: string,
): Promise<MfaChallengeRecord | null> {
  if (!redisAvailable) return null
  try {
    const raw = await getRedis().get(mfaKey(challengeId))
    return raw ? (JSON.parse(raw) as MfaChallengeRecord) : null
  } catch {
    return null
  }
}

export async function updateMfaChallenge(
  record: MfaChallengeRecord,
): Promise<boolean> {
  if (!redisAvailable) return false
  try {
    const key = mfaKey(record.challengeId)
    const client = getRedis()
    const ttl = await client.ttl(key)
    const safeTtl = ttl > 0 ? ttl : MFA_CHALLENGE_TTL_SECONDS
    await client.set(key, JSON.stringify(record), 'EX', safeTtl)
    return true
  } catch {
    return false
  }
}

export async function deleteMfaChallenge(challengeId: string): Promise<void> {
  if (!redisAvailable) return
  try {
    await getRedis().del(mfaKey(challengeId))
  } catch {
    /* ignore */
  }
}
