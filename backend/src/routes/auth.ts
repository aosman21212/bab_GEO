import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models.js'
import {
  ADMIN_JWT_EXPIRES_SECONDS,
  getUser,
  readBearerPayload,
  requireAuth,
  signToken,
} from '../middleware/auth.js'
import { recordLoginActivity, clientIpFromRequest } from '../login-activity.js'
import { denySession, rateLimit } from '../cache.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const ip = clientIpFromRequest(req) || 'unknown'
  const ipLimit = await rateLimit(`rl:login:ip:${ip}`, 10, 60)
  if (!ipLimit.ok) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' })
  }

  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials payload' })
  }

  const email = parsed.data.email.toLowerCase().trim()
  const emailLimit = await rateLimit(`rl:login:email:${email}`, 10, 60)
  if (!emailLimit.ok) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' })
  }

  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

  const token = signToken({ sub: String(user._id), email: user.email, role: user.role })

  void recordLoginActivity({
    userId: String(user._id),
    email: user.email,
    req,
  }).catch((err) => {
    console.error('[auth] Failed to record login activity:', err)
  })

  return res.json({ token, user: { email: user.email, role: user.role } })
})

authRouter.post('/logout', async (req, res) => {
  const payload = readBearerPayload(req, { ignoreExpiration: true })
  if (payload?.sid) {
    await denySession(payload.sid, ADMIN_JWT_EXPIRES_SECONDS)
  }
  return res.json({ ok: true })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const auth = getUser(req)
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })

  const user = await User.findById(auth.sub).select('-passwordHash').lean()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  return res.json({
    id: String(user._id),
    email: user.email,
    role: user.role,
  })
})
