import { Router } from 'express'
import { z } from 'zod'
import { Inquiry } from '../models.js'
import { rateLimit } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

export const inquiriesRouter = Router()

inquiriesRouter.post('/', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const limit = await rateLimit(`rl:inquiry:${ip}`, 5, 60)
  if (!limit.ok) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const parsed = z
    .object({
      name: z.string().min(1),
      company: z.string().optional(),
      phone: z.string().min(1),
      email: z.string().email(),
      project: z.string().min(1),
      locale: z.enum(['en', 'ar']).optional(),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid inquiry', details: parsed.error.flatten() })
  }

  const inquiry = await Inquiry.create({
    ...parsed.data,
    locale: parsed.data.locale ?? 'en',
  })

  return res.status(201).json({ ok: true, id: inquiry._id })
})

inquiriesRouter.get('/', requireAuth, async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  const filter = status ? { status } : {}
  const items = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  return res.json(items)
})

inquiriesRouter.patch('/:id', requireAuth, async (req, res) => {
  const parsed = z
    .object({ status: z.enum(['new', 'read', 'archived']) })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid status' })

  const item = await Inquiry.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  return res.json(item)
})
