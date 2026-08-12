import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config.js'

export type AuthPayload = { sub: string; email: string; role: string }

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload
    ;(req as Request & { user?: AuthPayload }).user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function getUser(req: Request) {
  return (req as Request & { user?: AuthPayload }).user
}
