import { Router } from 'express'
import { z } from 'zod'
import { Partner } from '../models.js'
import { cacheDel, cacheGet, cacheSet } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

export const partnersRouter = Router()

partnersRouter.get('/', async (_req, res) => {
  const cacheKey = 'partners'
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const partners = await Partner.find({ active: true }).sort({ order: 1 }).lean()
  await cacheSet(cacheKey, partners)
  return res.json(partners)
})

partnersRouter.get('/admin/all', requireAuth, async (_req, res) => {
  const partners = await Partner.find().sort({ order: 1 }).lean()
  return res.json(partners)
})

partnersRouter.post('/', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      slug: z.string().min(1),
      name: z.string().min(1),
      logoUrl: z.string().min(1),
      websiteUrl: z.string().optional(),
      order: z.number().optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const partner = await Partner.create({
    ...parsed.data,
    websiteUrl: parsed.data.websiteUrl || '',
  })
  await cacheDel('partners')
  return res.status(201).json(partner)
})

partnersRouter.put('/:id', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      slug: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      logoUrl: z.string().min(1).optional(),
      websiteUrl: z.string().optional(),
      order: z.number().optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const partner = await Partner.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
  if (!partner) return res.status(404).json({ error: 'Not found' })
  await cacheDel('partners')
  return res.json(partner)
})

partnersRouter.delete('/:id', requireAuth, async (req, res) => {
  const partner = await Partner.findByIdAndDelete(req.params.id)
  if (!partner) return res.status(404).json({ error: 'Not found' })
  await cacheDel('partners')
  return res.json({ ok: true })
})
