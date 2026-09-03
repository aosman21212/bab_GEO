import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { LoginActivity, User } from '../models.js'
import { getUser, requireAuth } from '../middleware/auth.js'

export const usersRouter = Router()

function publicUser(u: { _id: unknown; email: string; role: string; createdAt?: Date }) {
  return {
    _id: String(u._id),
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }
}

usersRouter.use(requireAuth)

usersRouter.get('/activity', async (_req, res) => {
  const items = await LoginActivity.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()

  return res.json(
    items.map((row) => ({
      _id: String(row._id),
      email: row.email,
      ip: row.ip || '',
      userAgent: row.userAgent || '',
      city: row.city || '',
      country: row.country || '',
      createdAt: row.createdAt,
    })),
  )
})

usersRouter.get('/', async (_req, res) => {
  const users = await User.find().sort({ createdAt: 1 }).select('-passwordHash').lean()
  return res.json(users.map(publicUser))
})

usersRouter.post('/', async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
  }

  const email = parsed.data.email.toLowerCase().trim()
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already in use' })

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  try {
    const user = await User.create({ email, passwordHash, role: 'admin' })
    return res.status(201).json(publicUser(user))
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 11000) return res.status(409).json({ error: 'Email already in use' })
    throw err
  }
})

usersRouter.patch('/:id', async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
  }

  if (!parsed.data.email && !parsed.data.password) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  const update: { email?: string; passwordHash?: string } = {}
  if (parsed.data.email) {
    update.email = parsed.data.email.toLowerCase().trim()
    const conflict = await User.findOne({
      email: update.email,
      _id: { $ne: req.params.id },
    })
    if (conflict) return res.status(409).json({ error: 'Email already in use' })
  }
  if (parsed.data.password) {
    update.passwordHash = await bcrypt.hash(parsed.data.password, 10)
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select(
      '-passwordHash',
    )
    if (!user) return res.status(404).json({ error: 'Not found' })
    return res.json(publicUser(user))
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 11000) return res.status(409).json({ error: 'Email already in use' })
    throw err
  }
})

usersRouter.delete('/:id', async (req, res) => {
  const me = getUser(req)
  if (!me) return res.status(401).json({ error: 'Unauthorized' })

  if (me.sub === req.params.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' })
  }

  const count = await User.countDocuments()
  if (count <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last admin' })
  }

  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ error: 'Not found' })
  return res.json({ ok: true })
})
