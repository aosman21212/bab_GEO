import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Page } from './models.js'
import { cacheDel } from './cache.js'

export const HOME_PAGE_SLUG = 'home'

const DEFAULT_HERO_SLIDES = ['/images/hero-man-phone.png', '/images/support-headset.png']
const DEFAULT_INDUSTRY_IMAGES: Record<string, string> = {
  food: '/images/industries/food.png',
  government: '/images/industries/government.png',
  healthcare: '/images/industries/healthcare.png',
  insurance: '/images/industries/insurance.png',
  retail: '/images/industries/retail.png',
}
const DEFAULT_TRANSFORMATION_IMAGE = '/images/riyadh-skyline.png'
const DEFAULT_IMPACT_IMAGE = '/images/bg-ss3.webp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

type MessageTree = Record<string, unknown>

function isObj(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asObj(value: unknown): MessageTree {
  return isObj(value) ? value : {}
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function faqsFrom(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const row = asObj(item)
      return { question: str(row.question).trim(), answer: str(row.answer).trim() }
    })
    .filter((item) => item.question && item.answer)
}

function pair(value: unknown) {
  const row = asObj(value)
  return { title: str(row.title), body: str(row.body) }
}

function pillar(value: unknown) {
  const row = asObj(value)
  return { label: str(row.label), title: str(row.title), body: str(row.body) }
}

function industry(value: unknown, image: string) {
  const row = asObj(value)
  return {
    tab: str(row.tab),
    title: str(row.title),
    body: str(row.body),
    image: str(row.image, image),
  }
}

export function loadFrontendMessages(locale: 'en' | 'ar'): MessageTree {
  const file = path.join(root, 'frontend', 'messages', `${locale}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as MessageTree
}

export function homepageLocaleFromMessages(messages: MessageTree, locale: 'en' | 'ar') {
  const hero = asObj(messages.hero)
  const works = asObj(messages.works)
  const workItems = asObj(works.items)
  const experience = asObj(messages.experience)
  const industries = asObj(messages.industries)
  const stats = asObj(messages.stats)
  const transformation = asObj(messages.transformation)
  const channels = asObj(messages.channels)
  const partners = asObj(messages.partners)
  const testimonials = asObj(messages.testimonials)
  const faq = asObj(messages.faq)
  const impact = asObj(messages.impact)
  const cta = asObj(messages.cta)
  const siteSettings = asObj(messages.siteSettings)
  const faqKey = locale === 'ar' ? 'homepageFaqsAr' : 'homepageFaqsEn'
  const seoTitle = locale === 'ar' ? siteSettings.seoTitleAr : siteSettings.seoTitleEn
  const seoDescription =
    locale === 'ar' ? siteSettings.seoDescriptionAr : siteSettings.seoDescriptionEn

  return {
    metaTitle: str(seoTitle),
    metaDescription: str(seoDescription),
    hero: {
      title: str(hero.title),
      body: str(hero.body),
      cta: str(hero.cta),
      slides: [...DEFAULT_HERO_SLIDES],
    },
    works: {
      title: str(works.title),
      items: {
        productivity: pair(workItems.productivity),
        experience: pair(workItems.experience),
        reporting: pair(workItems.reporting),
      },
    },
    experience: {
      eyebrow: str(experience.eyebrow),
      title: str(experience.title),
      watermark: str(experience.watermark),
      connect: pillar(experience.connect),
      engage: pillar(experience.engage),
      analyze: pillar(experience.analyze),
    },
    industries: {
      eyebrow: str(industries.eyebrow),
      title: str(industries.title),
      bookDemo: str(industries.bookDemo),
      food: industry(industries.food, DEFAULT_INDUSTRY_IMAGES.food),
      government: industry(industries.government, DEFAULT_INDUSTRY_IMAGES.government),
      healthcare: industry(industries.healthcare, DEFAULT_INDUSTRY_IMAGES.healthcare),
      insurance: industry(industries.insurance, DEFAULT_INDUSTRY_IMAGES.insurance),
      retail: industry(industries.retail, DEFAULT_INDUSTRY_IMAGES.retail),
    },
    stats: {
      sms: str(stats.sms),
      vas: str(stats.vas),
      language: str(stats.language),
      ott: str(stats.ott),
      nlu: str(stats.nlu),
      genai: str(stats.genai),
    },
    transformation: {
      badge: str(transformation.badge),
      title: str(transformation.title),
      body: str(transformation.body),
      cta: str(transformation.cta),
      image: DEFAULT_TRANSFORMATION_IMAGE,
    },
    channels: {
      headline: str(channels.headline),
      body: str(channels.body),
    },
    partners: {
      title: str(partners.title),
      body: str(partners.body),
      cta: str(partners.cta),
    },
    testimonials: { title: str(testimonials.title) },
    faq: {
      eyebrow: str(faq.eyebrow),
      title: str(faq.title),
      items: faqsFrom(siteSettings[faqKey]),
    },
    impact: {
      eyebrow: str(impact.eyebrow),
      title: str(impact.title),
      body: str(impact.body),
      cta: str(impact.cta),
      image: DEFAULT_IMPACT_IMAGE,
    },
    cta: {
      title: str(cta.title),
      body: str(cta.body),
    },
  }
}

export async function ensureHomePage() {
  const existing = await Page.findOne({ slug: HOME_PAGE_SLUG })
  if (existing) {
    if (existing.category !== 'home') {
      existing.category = 'home'
      existing.landingType = undefined
      await existing.save()
      await cacheDel(`page:${HOME_PAGE_SLUG}:en`, `page:${HOME_PAGE_SLUG}:ar`)
    }
    return existing
  }

  const en = homepageLocaleFromMessages(loadFrontendMessages('en'), 'en')
  const ar = homepageLocaleFromMessages(loadFrontendMessages('ar'), 'ar')
  const page = await Page.create({
    slug: HOME_PAGE_SLUG,
    category: 'home',
    status: 'published',
    locales: { en, ar },
  })
  await cacheDel(`page:${HOME_PAGE_SLUG}:en`, `page:${HOME_PAGE_SLUG}:ar`)
  return page
}
