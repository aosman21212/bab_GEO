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
      category: z.enum(['solution', 'industry', 'product', 'case-study', 'article', 'landing']),
      landingType: z.enum(['lead-form', 'whatsapp']).optional(),
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

  if (parsed.data.category === 'landing' && !parsed.data.landingType) {
    return res.status(400).json({ error: 'landingType is required for landing pages' })
  }

  const exists = await Page.findOne({ slug: parsed.data.slug })
  if (exists) return res.status(409).json({ error: 'Slug already exists' })

  const page = await Page.create({
    ...parsed.data,
    landingType: parsed.data.category === 'landing' ? parsed.data.landingType : undefined,
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

/** Public catalog of published pages for sitemap / GEO llms.txt / nav / Success Stories */
pagesRouter.get('/meta/published', async (_req, res) => {
  const pages = await Page.find({ status: 'published' })
    .select(
      'slug category locales.en.metaTitle locales.en.heroHeading locales.en.heroDescription locales.en.eyebrow locales.en.image locales.en.metaDescription locales.ar.metaTitle locales.ar.heroHeading locales.ar.heroDescription locales.ar.eyebrow locales.ar.image locales.ar.metaDescription updatedAt',
    )
    .sort({ updatedAt: -1 })
    .lean()

  return res.json(
    pages.map((page) => {
      const en = (page.locales?.en ?? {}) as {
        metaTitle?: string
        heroHeading?: string
        heroDescription?: string
        eyebrow?: string
        image?: string
        metaDescription?: string
      }
      const ar = (page.locales?.ar ?? {}) as {
        metaTitle?: string
        heroHeading?: string
        heroDescription?: string
        eyebrow?: string
        image?: string
        metaDescription?: string
      }
      const titleEn = String(en.metaTitle || en.heroHeading || page.slug)
      const titleAr = String(ar.metaTitle || ar.heroHeading || titleEn)
      const image = String(en.image || ar.image || '/images/bab-hero.png')
      return {
        slug: page.slug,
        category: page.category,
        title: titleEn,
        titleEn,
        titleAr,
        image,
        imageEn: String(en.image || image),
        imageAr: String(ar.image || en.image || image),
        eyebrowEn: String(en.eyebrow || ''),
        eyebrowAr: String(ar.eyebrow || en.eyebrow || ''),
        summaryEn: String(en.heroDescription || en.metaDescription || ''),
        summaryAr: String(ar.heroDescription || ar.metaDescription || en.heroDescription || en.metaDescription || ''),
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
      ? {
          slug: page.slug,
          category: page.category,
          landingType: page.landingType,
          status: page.status,
          ...en,
          ...ar,
        }
      : {
          slug: page.slug,
          category: page.category,
          landingType: page.landingType,
          status: page.status,
          ...en,
        }

  await cacheSet(cacheKey, payload)
  return res.json(payload)
})

pagesRouter.put('/:slug', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      category: z.enum(['solution', 'industry', 'product', 'case-study', 'article', 'landing']).optional(),
      landingType: z.enum(['lead-form', 'whatsapp']).optional(),
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

  const update: Record<string, unknown> = { ...parsed.data }
  if (update.category && update.category !== 'landing') {
    update.landingType = undefined
  }
  if (update.category === 'landing' && !update.landingType) {
    const existing = await Page.findOne({ slug: req.params.slug }).lean()
    if (!existing?.landingType) {
      return res.status(400).json({ error: 'landingType is required for landing pages' })
    }
  }

  const page = await Page.findOneAndUpdate({ slug: req.params.slug }, update, {
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
