import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models.js'
import { getUser, requireAuth, signToken } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials payload' })
  }

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

  const token = signToken({ sub: String(user._id), email: user.email, role: user.role })
  return res.json({ token, user: { email: user.email, role: user.role } })
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
