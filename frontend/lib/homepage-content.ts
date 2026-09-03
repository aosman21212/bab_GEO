import { HOME_PAGE_SLUG } from '@/lib/page-categories'

export const INDUSTRY_IDS = ['food', 'government', 'healthcare', 'insurance', 'retail'] as const
export type HomepageIndustryId = (typeof INDUSTRY_IDS)[number]

export const WORK_IDS = ['productivity', 'experience', 'reporting'] as const
export type HomepageWorkId = (typeof WORK_IDS)[number]

export const PILLAR_IDS = ['connect', 'engage', 'analyze'] as const
export type HomepagePillarId = (typeof PILLAR_IDS)[number]

export const STAT_IDS = ['sms', 'vas', 'language', 'ott', 'nlu', 'genai'] as const
export type HomepageStatId = (typeof STAT_IDS)[number]

export const DEFAULT_HERO_SLIDES = [
  '/images/hero-man-phone.png',
  '/images/support-headset.png',
] as const

export const DEFAULT_INDUSTRY_IMAGES: Record<HomepageIndustryId, string> = {
  food: '/images/industries/food.png',
  government: '/images/industries/government.png',
  healthcare: '/images/industries/healthcare.png',
  insurance: '/images/industries/insurance.png',
  retail: '/images/industries/retail.png',
}

export const DEFAULT_TRANSFORMATION_IMAGE = '/images/riyadh-skyline.png'
export const DEFAULT_IMPACT_IMAGE = '/images/bg-ss3.webp'

export type HomepageFaqItem = { question: string; answer: string }

export type HomepageTextPair = { title: string; body: string }

export type HomepagePillar = { label: string; title: string; body: string }

export type HomepageIndustry = {
  tab: string
  title: string
  body: string
  image: string
}

export type HomepageLocaleData = {
  metaTitle: string
  metaDescription: string
  hero: { title: string; body: string; cta: string; slides: string[] }
  works: { title: string; items: Record<HomepageWorkId, HomepageTextPair> }
  experience: {
    eyebrow: string
    title: string
    watermark: string
  } & Record<HomepagePillarId, HomepagePillar>
  industries: {
    eyebrow: string
    title: string
    bookDemo: string
  } & Record<HomepageIndustryId, HomepageIndustry>
  stats: Record<HomepageStatId, string>
  transformation: { badge: string; title: string; body: string; cta: string; image: string }
  channels: { headline: string; body: string }
  partners: { title: string; body: string; cta: string }
  testimonials: { title: string }
  faq: { eyebrow: string; title: string; items: HomepageFaqItem[] }
  impact: { eyebrow: string; title: string; body: string; cta: string; image: string }
  cta: { title: string; body: string }
}

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

function pickStr(value: unknown, fallback: string): string {
  const next = typeof value === 'string' ? value.trim() : ''
  return next || fallback
}

function pickSlides(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  const next = value.map((item) => String(item).trim()).filter(Boolean)
  return next.length ? next : fallback
}

function pickFaqs(value: unknown, fallback: HomepageFaqItem[]): HomepageFaqItem[] {
  if (!Array.isArray(value)) return fallback
  const next = value
    .map((item) => {
      const row = asObj(item)
      return { question: str(row.question).trim(), answer: str(row.answer).trim() }
    })
    .filter((item) => item.question && item.answer)
  return next.length ? next : fallback
}

function textPair(value: unknown, fallback: HomepageTextPair): HomepageTextPair {
  const row = asObj(value)
  return {
    title: pickStr(row.title, fallback.title),
    body: pickStr(row.body, fallback.body),
  }
}

function pillar(value: unknown, fallback: HomepagePillar): HomepagePillar {
  const row = asObj(value)
  return {
    label: pickStr(row.label, fallback.label),
    title: pickStr(row.title, fallback.title),
    body: pickStr(row.body, fallback.body),
  }
}

function industry(value: unknown, fallback: HomepageIndustry): HomepageIndustry {
  const row = asObj(value)
  return {
    tab: pickStr(row.tab, fallback.tab),
    title: pickStr(row.title, fallback.title),
    body: pickStr(row.body, fallback.body),
    image: pickStr(row.image, fallback.image),
  }
}

export function emptyHomepageLocale(): HomepageLocaleData {
  const emptyPair = { title: '', body: '' }
  const emptyPillar = { label: '', title: '', body: '' }
  const emptyIndustry = { tab: '', title: '', body: '', image: DEFAULT_INDUSTRY_IMAGES.food }
  return {
    metaTitle: '',
    metaDescription: '',
    hero: { title: '', body: '', cta: '', slides: [...DEFAULT_HERO_SLIDES] },
    works: {
      title: '',
      items: {
        productivity: { ...emptyPair },
        experience: { ...emptyPair },
        reporting: { ...emptyPair },
      },
    },
    experience: {
      eyebrow: '',
      title: '',
      watermark: '',
      connect: { ...emptyPillar },
      engage: { ...emptyPillar },
      analyze: { ...emptyPillar },
    },
    industries: {
      eyebrow: '',
      title: '',
      bookDemo: '',
      food: { ...emptyIndustry, image: DEFAULT_INDUSTRY_IMAGES.food },
      government: { ...emptyIndustry, image: DEFAULT_INDUSTRY_IMAGES.government },
      healthcare: { ...emptyIndustry, image: DEFAULT_INDUSTRY_IMAGES.healthcare },
      insurance: { ...emptyIndustry, image: DEFAULT_INDUSTRY_IMAGES.insurance },
      retail: { ...emptyIndustry, image: DEFAULT_INDUSTRY_IMAGES.retail },
    },
    stats: { sms: '', vas: '', language: '', ott: '', nlu: '', genai: '' },
    transformation: {
      badge: '',
      title: '',
      body: '',
      cta: '',
      image: DEFAULT_TRANSFORMATION_IMAGE,
    },
    channels: { headline: '', body: '' },
    partners: { title: '', body: '', cta: '' },
    testimonials: { title: '' },
    faq: { eyebrow: '', title: '', items: [] },
    impact: {
      eyebrow: '',
      title: '',
      body: '',
      cta: '',
      image: DEFAULT_IMPACT_IMAGE,
    },
    cta: { title: '', body: '' },
  }
}

export function buildHomepageLocaleFromMessages(
  messages: MessageTree,
  locale: 'en' | 'ar',
): HomepageLocaleData {
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

  const items = {
    productivity: textPair(workItems.productivity, { title: '', body: '' }),
    experience: textPair(workItems.experience, { title: '', body: '' }),
    reporting: textPair(workItems.reporting, { title: '', body: '' }),
  }

  const industryBlock = (id: HomepageIndustryId): HomepageIndustry =>
    industry(industries[id], {
      tab: '',
      title: '',
      body: '',
      image: DEFAULT_INDUSTRY_IMAGES[id],
    })

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
      items,
    },
    experience: {
      eyebrow: str(experience.eyebrow),
      title: str(experience.title),
      watermark: str(experience.watermark),
      connect: pillar(experience.connect, { label: '', title: '', body: '' }),
      engage: pillar(experience.engage, { label: '', title: '', body: '' }),
      analyze: pillar(experience.analyze, { label: '', title: '', body: '' }),
    },
    industries: {
      eyebrow: str(industries.eyebrow),
      title: str(industries.title),
      bookDemo: str(industries.bookDemo),
      food: industryBlock('food'),
      government: industryBlock('government'),
      healthcare: industryBlock('healthcare'),
      insurance: industryBlock('insurance'),
      retail: industryBlock('retail'),
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
    testimonials: {
      title: str(testimonials.title),
    },
    faq: {
      eyebrow: str(faq.eyebrow),
      title: str(faq.title),
      items: pickFaqs(siteSettings[faqKey], []),
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

export function mergeHomepageLocale(
  base: HomepageLocaleData,
  overlay: unknown,
): HomepageLocaleData {
  const raw = asObj(overlay)
  const hero = asObj(raw.hero)
  const works = asObj(raw.works)
  const workItems = asObj(works.items)
  const experience = asObj(raw.experience)
  const industries = asObj(raw.industries)
  const stats = asObj(raw.stats)
  const transformation = asObj(raw.transformation)
  const channels = asObj(raw.channels)
  const partners = asObj(raw.partners)
  const testimonials = asObj(raw.testimonials)
  const faq = asObj(raw.faq)
  const impact = asObj(raw.impact)
  const cta = asObj(raw.cta)

  return {
    metaTitle: pickStr(raw.metaTitle, base.metaTitle),
    metaDescription: pickStr(raw.metaDescription, base.metaDescription),
    hero: {
      title: pickStr(hero.title, base.hero.title),
      body: pickStr(hero.body, base.hero.body),
      cta: pickStr(hero.cta, base.hero.cta),
      slides: pickSlides(hero.slides, base.hero.slides),
    },
    works: {
      title: pickStr(works.title, base.works.title),
      items: {
        productivity: textPair(workItems.productivity, base.works.items.productivity),
        experience: textPair(workItems.experience, base.works.items.experience),
        reporting: textPair(workItems.reporting, base.works.items.reporting),
      },
    },
    experience: {
      eyebrow: pickStr(experience.eyebrow, base.experience.eyebrow),
      title: pickStr(experience.title, base.experience.title),
      watermark: pickStr(experience.watermark, base.experience.watermark),
      connect: pillar(experience.connect, base.experience.connect),
      engage: pillar(experience.engage, base.experience.engage),
      analyze: pillar(experience.analyze, base.experience.analyze),
    },
    industries: {
      eyebrow: pickStr(industries.eyebrow, base.industries.eyebrow),
      title: pickStr(industries.title, base.industries.title),
      bookDemo: pickStr(industries.bookDemo, base.industries.bookDemo),
      food: industry(industries.food, base.industries.food),
      government: industry(industries.government, base.industries.government),
      healthcare: industry(industries.healthcare, base.industries.healthcare),
      insurance: industry(industries.insurance, base.industries.insurance),
      retail: industry(industries.retail, base.industries.retail),
    },
    stats: {
      sms: pickStr(stats.sms, base.stats.sms),
      vas: pickStr(stats.vas, base.stats.vas),
      language: pickStr(stats.language, base.stats.language),
      ott: pickStr(stats.ott, base.stats.ott),
      nlu: pickStr(stats.nlu, base.stats.nlu),
      genai: pickStr(stats.genai, base.stats.genai),
    },
    transformation: {
      badge: pickStr(transformation.badge, base.transformation.badge),
      title: pickStr(transformation.title, base.transformation.title),
      body: pickStr(transformation.body, base.transformation.body),
      cta: pickStr(transformation.cta, base.transformation.cta),
      image: pickStr(transformation.image, base.transformation.image),
    },
    channels: {
      headline: pickStr(channels.headline, base.channels.headline),
      body: pickStr(channels.body, base.channels.body),
    },
    partners: {
      title: pickStr(partners.title, base.partners.title),
      body: pickStr(partners.body, base.partners.body),
      cta: pickStr(partners.cta, base.partners.cta),
    },
    testimonials: {
      title: pickStr(testimonials.title, base.testimonials.title),
    },
    faq: {
      eyebrow: pickStr(faq.eyebrow, base.faq.eyebrow),
      title: pickStr(faq.title, base.faq.title),
      items: pickFaqs(faq.items, base.faq.items),
    },
    impact: {
      eyebrow: pickStr(impact.eyebrow, base.impact.eyebrow),
      title: pickStr(impact.title, base.impact.title),
      body: pickStr(impact.body, base.impact.body),
      cta: pickStr(impact.cta, base.impact.cta),
      image: pickStr(impact.image, base.impact.image),
    },
    cta: {
      title: pickStr(cta.title, base.cta.title),
      body: pickStr(cta.body, base.cta.body),
    },
  }
}

export function homepageTitleFromLocales(locales?: {
  en?: Record<string, unknown>
  ar?: Record<string, unknown>
}) {
  const en = asObj(locales?.en)
  const ar = asObj(locales?.ar)
  const enHero = asObj(en.hero)
  const arHero = asObj(ar.hero)
  return {
    en: pickStr(en.metaTitle, pickStr(enHero.title, HOME_PAGE_SLUG)),
    ar: pickStr(ar.metaTitle, pickStr(arHero.title, '')),
  }
}
