import { Router } from 'express'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models.js'
import {
  ADMIN_JWT_EXPIRES_SECONDS,
  getUser,
  readBearerPayload,
  requireAuth,
  signMfaPendingToken,
  signToken,
  verifyMfaPendingToken,
} from '../middleware/auth.js'
import { recordLoginActivity, clientIpFromRequest } from '../login-activity.js'
import {
  deleteMfaChallenge,
  denySession,
  getMfaChallenge,
  MFA_CHALLENGE_TTL_SECONDS,
  MFA_MAX_ATTEMPTS,
  MFA_RESEND_COOLDOWN_SECONDS,
  MfaChallengeRecord,
  rateLimit,
  storeMfaChallenge,
  updateMfaChallenge,
} from '../cache.js'
import { sendMfaCodeEmail } from '../mail.js'
import { env } from '../config.js'

export const authRouter = Router()

function hashMfaCode(code: string): string {
  return crypto.createHmac('sha256', env.jwtSecret).update(code.trim()).digest('hex')
}

function generate6DigitCode(): string {
  return String(crypto.randomInt(100000, 1000000))
}

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
      locale: z.enum(['en', 'ar']).optional(),
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

  const challengeId = crypto.randomUUID()
  const code = generate6DigitCode()
  const codeHmac = hashMfaCode(code)
  const now = Date.now()
  const expiresAt = now + MFA_CHALLENGE_TTL_SECONDS * 1000
  const resendCooldownUntil = now + MFA_RESEND_COOLDOWN_SECONDS * 1000

  const stored = await storeMfaChallenge({
    challengeId,
    userId: String(user._id),
    email: user.email,
    codeHmac,
    attempts: 0,
    locked: false,
    expiresAt,
    resendCooldownUntil,
  })

  if (!stored) {
    return res.status(500).json({ error: 'System cache unavailable. Please try again later.' })
  }

  try {
    await sendMfaCodeEmail(user.email, code, parsed.data.locale || 'en')
  } catch (err) {
    console.error('[auth] Failed to send MFA email:', err)
    await deleteMfaChallenge(challengeId)
    return res.status(503).json({
      error:
        'Failed to send MFA verification code email. Please check server SMTP configuration.',
    })
  }

  const mfaToken = signMfaPendingToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    challengeId,
  })

  return res.json({
    mfaRequired: true,
    mfaToken,
    email: user.email,
    expiresAt,
    resendCooldownSeconds: MFA_RESEND_COOLDOWN_SECONDS,
  })
})

authRouter.post('/mfa/verify', async (req, res) => {
  const parsed = z
    .object({
      mfaToken: z.string().min(1),
      code: z.string().length(6),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Verification code must be 6 digits.' })
  }

  const pending = verifyMfaPendingToken(parsed.data.mfaToken)
  if (!pending) {
    return res
      .status(401)
      .json({ error: 'MFA session expired or invalid. Please sign in again.' })
  }

  const challenge = await getMfaChallenge(pending.challengeId)
  if (!challenge) {
    return res
      .status(400)
      .json({ error: 'MFA challenge expired. Please sign in again.' })
  }

  if (challenge.locked || challenge.attempts >= MFA_MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'MFA challenge locked due to too many failed attempts. Please sign in again.',
      locked: true,
    })
  }

  const providedHmac = hashMfaCode(parsed.data.code)
  if (providedHmac !== challenge.codeHmac) {
    const newAttempts = challenge.attempts + 1
    const locked = newAttempts >= MFA_MAX_ATTEMPTS
    await updateMfaChallenge({
      ...challenge,
      attempts: newAttempts,
      locked,
    })

    if (locked) {
      return res.status(429).json({
        error:
          'Maximum verification attempts exceeded (5/5). Login challenge locked. Please sign in again.',
        attemptsRemaining: 0,
        locked: true,
      })
    }

    const attemptsRemaining = MFA_MAX_ATTEMPTS - newAttempts
    return res.status(400).json({
      error: `Invalid verification code. ${attemptsRemaining} attempt(s) remaining.`,
      attemptsRemaining,
    })
  }

  // Correct code -> Invalidate challenge & issue full session JWT
  await deleteMfaChallenge(pending.challengeId)

  const token = signToken({
    sub: pending.sub,
    email: pending.email,
    role: pending.role,
  })

  void recordLoginActivity({
    userId: pending.sub,
    email: pending.email,
    req,
  }).catch((err) => {
    console.error('[auth] Failed to record login activity:', err)
  })

  return res.json({ token, user: { email: pending.email, role: pending.role } })
})

authRouter.post('/mfa/resend', async (req, res) => {
  const parsed = z
    .object({
      mfaToken: z.string().min(1),
      locale: z.enum(['en', 'ar']).optional(),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid MFA resend request' })
  }

  const pending = verifyMfaPendingToken(parsed.data.mfaToken)
  if (!pending) {
    return res
      .status(401)
      .json({ error: 'MFA session expired or invalid. Please sign in again.' })
  }

  const challenge = await getMfaChallenge(pending.challengeId)
  if (!challenge) {
    return res
      .status(400)
      .json({ error: 'MFA challenge expired. Please sign in again.' })
  }

  if (challenge.locked) {
    return res.status(429).json({
      error: 'MFA challenge locked. Please sign in again.',
      locked: true,
    })
  }

  const now = Date.now()
  if (now < challenge.resendCooldownUntil) {
    const secondsRemaining = Math.ceil((challenge.resendCooldownUntil - now) / 1000)
    return res.status(429).json({
      error: `Please wait ${secondsRemaining} second(s) before requesting a new code.`,
      secondsRemaining,
    })
  }

  const newCode = generate6DigitCode()
  const newHmac = hashMfaCode(newCode)
  const newCooldownUntil = now + MFA_RESEND_COOLDOWN_SECONDS * 1000

  const updatedChallenge: MfaChallengeRecord = {
    ...challenge,
    codeHmac: newHmac,
    resendCooldownUntil: newCooldownUntil,
  }

  try {
    await sendMfaCodeEmail(pending.email, newCode, parsed.data.locale || 'en')
  } catch (err) {
    console.error('[auth] Failed to resend MFA email:', err)
    return res.status(503).json({
      error: 'Failed to send new code email. Please check server SMTP configuration.',
    })
  }

  await updateMfaChallenge(updatedChallenge)

  return res.json({
    ok: true,
    resendCooldownSeconds: MFA_RESEND_COOLDOWN_SECONDS,
  })
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
