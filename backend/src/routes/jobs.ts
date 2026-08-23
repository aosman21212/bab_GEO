import { Router } from 'express'
import { z } from 'zod'
import { Job } from '../models.js'
import { cacheDel, cacheGet, cacheSet } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

export const jobsRouter = Router()

const employmentType = z.enum(['full-time', 'part-time', 'contract', 'internship'])
const jobStatus = z.enum(['open', 'closed'])

const jobBody = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  departmentEn: z.string().optional(),
  departmentAr: z.string().optional(),
  locationEn: z.string().optional(),
  locationAr: z.string().optional(),
  employmentType: employmentType.optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  status: jobStatus.optional(),
  order: z.number().optional(),
})

jobsRouter.get('/', async (_req, res) => {
  const cacheKey = 'jobs:open'
  const cached = await cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const jobs = await Job.find({ status: 'open' }).sort({ order: 1, createdAt: -1 }).lean()
  await cacheSet(cacheKey, jobs)
  return res.json(jobs)
})

jobsRouter.get('/admin/all', requireAuth, async (_req, res) => {
  const jobs = await Job.find().sort({ order: 1, createdAt: -1 }).lean()
  return res.json(jobs)
})

jobsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = jobBody.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  try {
    const job = await Job.create({
      ...parsed.data,
      departmentEn: parsed.data.departmentEn || '',
      departmentAr: parsed.data.departmentAr || '',
      locationEn: parsed.data.locationEn || '',
      locationAr: parsed.data.locationAr || '',
      descriptionEn: parsed.data.descriptionEn || '',
      descriptionAr: parsed.data.descriptionAr || '',
      employmentType: parsed.data.employmentType || 'full-time',
      status: parsed.data.status || 'open',
      order: parsed.data.order ?? 0,
    })
    await cacheDel('jobs:open')
    return res.status(201).json(job)
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 11000) return res.status(409).json({ error: 'Slug already exists' })
    throw err
  }
})

jobsRouter.put('/:id', requireAuth, async (req, res) => {
  const parsed = jobBody.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  try {
    const job = await Job.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
    if (!job) return res.status(404).json({ error: 'Not found' })
    await cacheDel('jobs:open')
    return res.json(job)
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 11000) return res.status(409).json({ error: 'Slug already exists' })
    throw err
  }
})

jobsRouter.delete('/:id', requireAuth, async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id)
  if (!job) return res.status(404).json({ error: 'Not found' })
  await cacheDel('jobs:open')
  return res.json({ ok: true })
})
