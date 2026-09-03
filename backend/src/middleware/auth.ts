import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config.js'
import { isSessionDenied } from '../cache.js'

export type AuthPayload = {
  sub: string
  email: string
  role: string
  sid: string
  mfaVerified?: boolean
}

export type MfaPendingPayload = {
  sub: string
  email: string
  role: string
  challengeId: string
  purpose: 'mfa_pending'
}

/** Must stay aligned with frontend ADMIN_SESSION_COOKIE_MAX_AGE (20 minutes). */
export const ADMIN_JWT_EXPIRES_IN = '20m'
export const ADMIN_JWT_EXPIRES_SECONDS = 20 * 60

/** Intermediate MFA verification token valid for 10 minutes. */
export const MFA_PENDING_EXPIRES_IN = '10m'

export const ADMIN_REFRESH_TOKEN_HEADER = 'x-admin-token'

export function signToken(payload: Omit<AuthPayload, 'sid'> & { sid?: string }) {
  const body: AuthPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    sid: payload.sid || crypto.randomUUID(),
    mfaVerified: true,
  }
  return jwt.sign(body, env.jwtSecret, { expiresIn: ADMIN_JWT_EXPIRES_IN })
}

export function signMfaPendingToken(payload: {
  sub: string
  email: string
  role: string
  challengeId: string
}): string {
  const body: MfaPendingPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    challengeId: payload.challengeId,
    purpose: 'mfa_pending',
  }
  return jwt.sign(body, env.jwtSecret, { expiresIn: MFA_PENDING_EXPIRES_IN })
}

export function verifyMfaPendingToken(token: string): MfaPendingPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as MfaPendingPayload
    if (decoded.purpose !== 'mfa_pending' || !decoded.challengeId) return null
    return decoded
  } catch {
    return null
  }
}

function payloadFromDecoded(decoded: AuthPayload): AuthPayload {
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
    sid: decoded.sid || crypto.randomUUID(),
    mfaVerified: decoded.mfaVerified === true,
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
    if (decoded.mfaVerified !== true) {
      return res.status(401).json({ error: 'MFA verification required' })
    }
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
