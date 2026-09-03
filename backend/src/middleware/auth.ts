import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config.js'

export type AuthPayload = { sub: string; email: string; role: string }

/** Must stay aligned with frontend ADMIN_SESSION_COOKIE_MAX_AGE (20 minutes). */
export const ADMIN_JWT_EXPIRES_IN = '20m'

export const ADMIN_REFRESH_TOKEN_HEADER = 'x-admin-token'

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: ADMIN_JWT_EXPIRES_IN })
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload
    const payload: AuthPayload = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    }
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
