import { Router } from 'express'
import { z } from 'zod'
import { Testimonial } from '../models.js'
import { cacheDel, cacheGet, cacheSet } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

export const testimonialsRouter = Router()

testimonialsRouter.get('/', async (req, res) => {
  const locale = typeof req.query.locale === 'string' ? req.query.locale : 'all'
  const cacheKey = `testimonials:${locale}`
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const filter =
    locale === 'en' || locale === 'ar'
      ? { active: true, locale: { $in: [locale, 'all'] } }
      : { active: true }

  const items = await Testimonial.find(filter).sort({ order: 1 }).lean()
  await cacheSet(cacheKey, items)
  return res.json(items)
})

testimonialsRouter.get('/admin/all', requireAuth, async (_req, res) => {
  const items = await Testimonial.find().sort({ order: 1 }).lean()
  return res.json(items)
})

testimonialsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(1),
      role: z.string().optional(),
      quote: z.string().min(1),
      logoUrl: z.string().min(1),
      order: z.number().optional(),
      locale: z.enum(['en', 'ar', 'all']).optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const item = await Testimonial.create(parsed.data)
  await cacheDel('testimonials:all', 'testimonials:en', 'testimonials:ar')
  return res.status(201).json(item)
})

testimonialsRouter.put('/:id', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(1).optional(),
      role: z.string().optional(),
      quote: z.string().min(1).optional(),
      logoUrl: z.string().min(1).optional(),
      order: z.number().optional(),
      locale: z.enum(['en', 'ar', 'all']).optional(),
      active: z.boolean().optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const item = await Testimonial.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  await cacheDel('testimonials:all', 'testimonials:en', 'testimonials:ar')
  return res.json(item)
})

testimonialsRouter.delete('/:id', requireAuth, async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  await cacheDel('testimonials:all', 'testimonials:en', 'testimonials:ar')
  return res.json({ ok: true })
})
