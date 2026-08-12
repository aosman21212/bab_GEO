import { Router } from 'express'
import { z } from 'zod'
import { SiteContent } from '../models.js'
import { cacheDel, cacheGet, cacheSet } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

export const contentRouter = Router()

contentRouter.get('/admin/:locale', requireAuth, async (req, res) => {
  const locale = req.params.locale
  if (locale !== 'en' && locale !== 'ar') {
    return res.status(400).json({ error: 'locale must be en or ar' })
  }
  const docs = await SiteContent.find({ locale }).sort({ key: 1 }).lean()
  return res.json(docs)
})

contentRouter.get('/:locale', async (req, res) => {
  const locale = req.params.locale
  if (locale !== 'en' && locale !== 'ar') {
    return res.status(400).json({ error: 'locale must be en or ar' })
  }

  const cacheKey = `content:${locale}`
  const cached = await cacheGet<Record<string, unknown>>(cacheKey)
  if (cached) return res.json(cached)

  const docs = await SiteContent.find({ locale }).lean()
  const payload: Record<string, unknown> = {}
  for (const doc of docs) payload[doc.key] = doc.data

  await cacheSet(cacheKey, payload)
  return res.json(payload)
})

contentRouter.put('/:locale/:key', requireAuth, async (req, res) => {
  const locale = req.params.locale
  const key = req.params.key
  if (locale !== 'en' && locale !== 'ar') {
    return res.status(400).json({ error: 'locale must be en or ar' })
  }

  const parsed = z.object({ data: z.unknown() }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'data required' })

  const doc = await SiteContent.findOneAndUpdate(
    { key, locale },
    { data: parsed.data.data },
    { upsert: true, new: true }
  )

  await cacheDel(`content:${locale}`)
  return res.json(doc)
})
