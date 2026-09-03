import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config.js'
import { isSessionDenied } from '../cache.js'

export type AuthPayload = { sub: string; email: string; role: string; sid: string }

/** Must stay aligned with frontend ADMIN_SESSION_COOKIE_MAX_AGE (20 minutes). */
export const ADMIN_JWT_EXPIRES_IN = '20m'
export const ADMIN_JWT_EXPIRES_SECONDS = 20 * 60

export const ADMIN_REFRESH_TOKEN_HEADER = 'x-admin-token'

export function signToken(payload: Omit<AuthPayload, 'sid'> & { sid?: string }) {
  const body: AuthPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    sid: payload.sid || crypto.randomUUID(),
  }
  return jwt.sign(body, env.jwtSecret, { expiresIn: ADMIN_JWT_EXPIRES_IN })
}

function payloadFromDecoded(decoded: AuthPayload): AuthPayload {
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
    sid: decoded.sid || crypto.randomUUID(),
  }
}

/** Verify Bearer JWT (signature checked; expiry may be ignored for logout). */
export function readBearerPayload(req: Request, opts?: { ignoreExpiration?: boolean }) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), env.jwtSecret, {
      ignoreExpiration: opts?.ignoreExpiration === true,
    }) as AuthPayload
  } catch {
    return null
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload
    if (await isSessionDenied(decoded.sid)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const payload = payloadFromDecoded(decoded)
    ;(req as Request & { user?: AuthPayload }).user = payload
    // Re-issue so active sessions keep working and stolen tokens die after idle window.
    res.setHeader(ADMIN_REFRESH_TOKEN_HEADER, signToken(payload))
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function getUser(req: Request) {
  return (req as Request & { user?: AuthPayload }).user
}
