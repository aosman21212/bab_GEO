import { Router } from 'express'
import { z } from 'zod'
import { Page } from '../models.js'
import { cacheDel, cacheGet, cacheSet } from '../cache.js'
import { requireAuth } from '../middleware/auth.js'

export const pagesRouter = Router()

pagesRouter.get('/', requireAuth, async (_req, res) => {
  const pages = await Page.find().sort({ updatedAt: -1 }).lean()
  return res.json(pages)
})

pagesRouter.post('/', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      slug: z
        .string()
        .min(1)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      category: z.enum(['solution', 'industry']),
      status: z.enum(['published', 'draft']).optional(),
      locales: z.object({
        en: z.record(z.unknown()),
        ar: z.record(z.unknown()).optional(),
      }),
    })
    .safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const exists = await Page.findOne({ slug: parsed.data.slug })
  if (exists) return res.status(409).json({ error: 'Slug already exists' })

  const page = await Page.create({
    ...parsed.data,
    status: parsed.data.status ?? 'published',
  })

  await cacheDel(`page:${page.slug}:en`, `page:${page.slug}:ar`)
  return res.status(201).json(page)
})

pagesRouter.get('/by-id/:slug', requireAuth, async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug }).lean()
  if (!page) return res.status(404).json({ error: 'Not found' })
  return res.json(page)
})

/** Public catalog of published pages for sitemap / GEO llms.txt */
pagesRouter.get('/meta/published', async (_req, res) => {
  const pages = await Page.find({ status: 'published' })
    .select('slug category locales.en.metaTitle locales.en.heroHeading updatedAt')
    .sort({ updatedAt: -1 })
    .lean()

  return res.json(
    pages.map((page) => {
      const en = (page.locales?.en ?? {}) as { metaTitle?: string; heroHeading?: string }
      return {
        slug: page.slug,
        category: page.category,
        title: String(en.metaTitle || en.heroHeading || page.slug),
        updatedAt: page.updatedAt,
      }
    }),
  )
})

pagesRouter.get('/:slug', async (req, res) => {
  const slug = req.params.slug
  const locale = typeof req.query.locale === 'string' ? req.query.locale : 'en'
  const cacheKey = `page:${slug}:${locale}`
  const cached = await cacheGet<Record<string, unknown>>(cacheKey)
  if (cached) {
    if (cached.status === 'draft') return res.status(404).json({ error: 'Not found' })
    return res.json(cached)
  }

  const page = await Page.findOne({ slug }).lean()
  if (!page) return res.status(404).json({ error: 'Not found' })
  if (page.status === 'draft') return res.status(404).json({ error: 'Not found' })

  const locales = page.locales ?? { en: {} }
  const en = (locales.en ?? {}) as Record<string, unknown>
  const ar = (locales.ar ?? {}) as Record<string, unknown>
  const payload =
    locale === 'ar'
      ? { slug: page.slug, category: page.category, status: page.status, ...en, ...ar }
      : { slug: page.slug, category: page.category, status: page.status, ...en }

  await cacheSet(cacheKey, payload)
  return res.json(payload)
})

pagesRouter.put('/:slug', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      category: z.enum(['solution', 'industry']).optional(),
      status: z.enum(['published', 'draft']).optional(),
      locales: z
        .object({
          en: z.unknown().optional(),
          ar: z.unknown().optional(),
        })
        .optional(),
    })
    .safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const page = await Page.findOneAndUpdate({ slug: req.params.slug }, parsed.data, {
    new: true,
    upsert: false,
  })
  if (!page) return res.status(404).json({ error: 'Not found' })

  await cacheDel(`page:${req.params.slug}:en`, `page:${req.params.slug}:ar`)
  return res.json(page)
})

pagesRouter.delete('/:slug', requireAuth, async (req, res) => {
  const page = await Page.findOneAndDelete({ slug: req.params.slug })
  if (!page) return res.status(404).json({ error: 'Not found' })
  await cacheDel(`page:${req.params.slug}:en`, `page:${req.params.slug}:ar`)
  return res.json({ ok: true })
})
