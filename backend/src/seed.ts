import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { connectMongo } from './db.js'
import { env } from './config.js'
import { User, SiteContent, Partner, Testimonial, Page, Job } from './models.js'
import { cacheDel } from './cache.js'
import { ensureRedis } from './cache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

const partnerSlugs = [
  'meta',
  'liveperson',
  'insider',
  'apple',
  'avaya',
  'aws',
  'microsoft',
  'cloudera',
  'genesys',
  'ibm',
  'oracle',
  'google-cloud',
]

const testimonialsSeed = [
  {
    name: 'Al Saberyah',
    quote:
      'Reliable, responsive, and technically strong. The team acted as a true partner, not just a vendor. Their ability to adapt the solution to our needs made a clear difference.',
    logoUrl: '/images/clients/alsaberyah.png',
  },
  {
    name: 'Alya Clinic',
    quote:
      'Reliable, responsive, and technically strong. The team acted as a true partner, not just a vendor. Their ability to adapt the solution to our needs made a clear difference.',
    logoUrl: '/images/clients/alya.png',
  },
  {
    name: "Chicker's",
    quote:
      'Reliable, responsive, and technically strong. The team acted as a true partner, not just a vendor. Their ability to adapt the solution to our needs made a clear difference.',
    logoUrl: '/images/clients/chickers.jpeg',
  },
  {
    name: 'منصة رائز التعليمية',
    quote:
      'Our collaboration with BAB has been instrumental in navigating complex project requirements. Their team brings a deep understanding of the Saudi market and a level of professional integrity that is rare to find.',
    logoUrl: '/images/clients/raiza.jpeg',
  },
  {
    name: 'ملتقى خطوة المهني',
    quote:
      'Outstanding support and innovative solutions! They helped us streamline our operations and achieve our goals ahead of schedule.',
    logoUrl: '/images/clients/asa.jpg',
  },
  {
    name: 'Sofia Mostafa Abuzaid',
    role: 'Customer Service Manager – Delta Laboratories',
    quote:
      "BAB has supported us in enhancing our customer experience through automated response solutions. We've seen a clear improvement in response time, customer satisfaction, and tangible results in engagement and conversion rates.",
    logoUrl: '/images/clients/delta-labs.jpg',
  },
  {
    name: 'Lama',
    role: 'Marketing Specialist & Customer Service Manager - Mazaj Maghribi',
    quote:
      'Our experience with BAB helped us connect with Mazaj Maghribi customers faster and smarter through WhatsApp. The solutions provided were simple and effective.',
    logoUrl: '/images/clients/lama.png',
  },
  {
    name: 'Rima Alshuail',
    role: 'Customer Service Department Lead – Fastlo',
    quote:
      'Our experience with BAB has been one that truly met our needs as a logistics company focused on customer care and meaningful engagement.',
    logoUrl: '/images/clients/logoL.png',
  },
]

function loadMessages(locale: 'en' | 'ar') {
  const file = path.join(root, 'frontend', 'messages', `${locale}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>
}

async function seedContent() {
  for (const locale of ['en', 'ar'] as const) {
    const messages = loadMessages(locale)
    for (const [key, data] of Object.entries(messages)) {
      await SiteContent.findOneAndUpdate(
        { key, locale },
        { data },
        { upsert: true, new: true }
      )
    }
    await cacheDel(`content:${locale}`)
    console.log(`[seed] content ${locale}: ${Object.keys(messages).length} keys`)
  }
}

async function seedPartners() {
  for (let i = 0; i < partnerSlugs.length; i++) {
    const slug = partnerSlugs[i]
    const name = slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    await Partner.findOneAndUpdate(
      { slug },
      {
        slug,
        name,
        logoUrl: `/images/partners/${slug}.png`,
        websiteUrl: '',
        order: i,
        active: true,
      },
      { upsert: true, new: true }
    )
  }
  await cacheDel('partners')
  console.log(`[seed] partners: ${partnerSlugs.length}`)
}

async function seedTestimonials() {
  await Testimonial.deleteMany({})
  for (let i = 0; i < testimonialsSeed.length; i++) {
    const t = testimonialsSeed[i]
    await Testimonial.create({
      ...t,
      order: i,
      locale: 'all',
      active: true,
    })
  }
  await cacheDel('testimonials:all', 'testimonials:en', 'testimonials:ar')
  console.log(`[seed] testimonials: ${testimonialsSeed.length}`)
}

async function seedPages() {
  // Lightweight page stubs from message-driven navigation; full EN body seeded as slug metadata.
  // Prefer reading a generated JSON if present.
  const pagesPath = path.join(root, 'backend', 'seed-data', 'pages.json')
  if (!fs.existsSync(pagesPath)) {
    console.warn('[seed] backend/seed-data/pages.json missing — skipping pages (run generate later)')
    return
  }
  const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8')) as Array<{
    slug: string
    category: 'solution' | 'industry' | 'product' | 'case-study' | 'article' | 'landing'
    landingType?: 'lead-form' | 'whatsapp'
    locales: { en: unknown; ar?: unknown }
  }>
  for (const page of pages) {
    await Page.findOneAndUpdate(
      { slug: page.slug },
      { ...page, status: 'published' },
      { upsert: true, new: true }
    )
    await cacheDel(`page:${page.slug}:en`, `page:${page.slug}:ar`)
  }
  // Remove retired comparison pages if present from earlier seeds
  const removed = await Page.deleteMany({
    slug: { $in: ['bab-vs-unifonic', 'bab-vs-lucidya'] },
  })
  if (removed.deletedCount) {
    await cacheDel(
      'page:bab-vs-unifonic:en',
      'page:bab-vs-unifonic:ar',
      'page:bab-vs-lucidya:en',
      'page:bab-vs-lucidya:ar',
    )
    console.log(`[seed] removed retired pages: ${removed.deletedCount}`)
  }
  console.log(`[seed] pages: ${pages.length}`)
}

const jobsSeed = [
  {
    slug: 'senior-customer-success-manager',
    titleEn: 'Senior Customer Success Manager',
    titleAr: 'مدير نجاح العملاء الأول',
    departmentEn: 'Customer Success',
    departmentAr: 'نجاح العملاء',
    locationEn: 'Riyadh, Saudi Arabia',
    locationAr: 'الرياض، المملكة العربية السعودية',
    employmentType: 'full-time' as const,
    descriptionEn:
      'Own enterprise customer relationships for BAB omnichannel and contact center platforms. Drive adoption, renewals, and measurable CX outcomes across Saudi and MENA accounts.',
    descriptionAr:
      'إدارة علاقات عملاء المؤسسات لمنصات باب للقنوات المتعددة ومراكز الاتصال. دفع التبني والتجديد وتحقيق نتائج ملموسة في تجربة العملاء عبر حسابات السعودية ومنطقة الشرق الأوسط وشمال أفريقيا.',
    order: 0,
  },
  {
    slug: 'solutions-engineer',
    titleEn: 'Solutions Engineer',
    titleAr: 'مهندس حلول',
    departmentEn: 'Pre-Sales',
    departmentAr: 'ما قبل البيع',
    locationEn: 'Riyadh, Saudi Arabia',
    locationAr: 'الرياض، المملكة العربية السعودية',
    employmentType: 'full-time' as const,
    descriptionEn:
      'Design and demo BAB communication solutions for enterprise prospects. Partner with sales on technical discovery, PoCs, and solution architecture.',
    descriptionAr:
      'تصميم وعرض حلول باب للاتصالات للمؤسسات. التعاون مع المبيعات في الاكتشاف التقني وإثبات المفهوم وهندسة الحلول.',
    order: 1,
  },
  {
    slug: 'frontend-developer-internship',
    titleEn: 'Frontend Developer (Internship)',
    titleAr: 'مطور واجهات أمامية (تدريب)',
    departmentEn: 'Engineering',
    departmentAr: 'الهندسة',
    locationEn: 'Riyadh, Saudi Arabia',
    locationAr: 'الرياض، المملكة العربية السعودية',
    employmentType: 'internship' as const,
    descriptionEn:
      'Join the product team to build bilingual web experiences for BAB platforms. Learn modern React/Next.js practices in a production environment.',
    descriptionAr:
      'انضم إلى فريق المنتج لبناء تجارب ويب ثنائية اللغة لمنصات باب. تعلّم ممارسات React/Next.js الحديثة في بيئة إنتاج.',
    order: 2,
  },
]

async function seedJobs() {
  for (const job of jobsSeed) {
    await Job.findOneAndUpdate(
      { slug: job.slug },
      { ...job, status: 'open' },
      { upsert: true, new: true },
    )
  }
  await cacheDel('jobs:open')
  console.log(`[seed] jobs: ${jobsSeed.length}`)
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(env.adminPassword, 10)
  await User.findOneAndUpdate(
    { email: env.adminEmail.toLowerCase() },
    { email: env.adminEmail.toLowerCase(), passwordHash, role: 'admin' },
    { upsert: true, new: true }
  )
  console.log(`[seed] admin: ${env.adminEmail}`)
}

async function main() {
  await connectMongo()
  await ensureRedis()
  await seedAdmin()
  await seedContent()
  await seedPartners()
  await seedTestimonials()
  await seedPages()
  await seedJobs()
  console.log('[seed] done')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
