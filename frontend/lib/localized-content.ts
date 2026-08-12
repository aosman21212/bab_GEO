import type { Locale } from '@/i18n/routing'
import { getPage, type PageContent } from '@/lib/site-content'

/** Arabic overlays for solution/industry pages (hero + meta). */
const arOverlays: Record<
  string,
  Partial<Pick<PageContent, 'metaTitle' | 'metaDescription' | 'eyebrow' | 'heroHeading' | 'heroDescription' | 'ctaLabel' | 'impact'>>
> = {
  omnichannel: {
    metaTitle: 'القنوات المتعددة',
    eyebrow: 'القنوات المتعددة',
    heroHeading: 'وحّد كل نقاط التواصل. وقدّم رحلات عملاء سلسة',
    heroDescription:
      'اربط العملاء وتفاعل معهم واحتفظ بهم عبر جميع القنوات بحلولنا المتقدمة للقنوات المتعددة — وحوّل كل تفاعل إلى فرصة نمو.',
    ctaLabel: 'ابدأ التحول الرقمي اليوم',
    impact: {
      heading: 'وحّد تجربة عملائك — اربط كل القنوات مع حلول باب',
      text: 'تواصل مع باب اليوم لاستكشاف حلول تواصل متعددة القنوات مخصصة لأعمالك.',
    },
  },
  'live-engagement-platform': {
    metaTitle: 'منصة التفاعل المباشر',
    eyebrow: 'منصة التفاعل المباشر',
    heroHeading: 'حوّل كل زائر إلى محادثة فورية',
    heroDescription: 'عزّز التفاعل، وأجب عن الأسئلة فوراً، وحوّل أسرع بأدوات التفاعل المباشر.',
    ctaLabel: 'تواصل معنا',
  },
  'rich-communication-services': {
    metaTitle: 'خدمات التواصل الغني',
    eyebrow: 'خدمات التواصل الغني',
    heroHeading: 'رسائل غنية تتجاوز الرسائل النصية التقليدية',
    ctaLabel: 'تواصل معنا',
  },
  'social-media-messaging-integration': {
    metaTitle: 'منصة الرسائل الحوارية',
    eyebrow: 'منصة الرسائل الحوارية',
    ctaLabel: 'تواصل معنا',
  },
  'digital-transformation': {
    metaTitle: 'حلول التحول الرقمي',
    eyebrow: 'التحول الرقمي',
    heroHeading: 'نهج أصيل يعتمد على الذكاء الاصطناعي للتحول الرقمي',
    ctaLabel: 'تعرّف علينا',
  },
  'voice-bot': {
    metaTitle: 'روبوت الصوت',
    eyebrow: 'روبوت الصوت',
    ctaLabel: 'تواصل معنا',
  },
  'ai-solution': {
    metaTitle: 'حلول الذكاء الاصطناعي',
    eyebrow: 'حلول الذكاء الاصطناعي',
    ctaLabel: 'تواصل معنا',
  },
  'call-center': {
    metaTitle: 'مركز الاتصال',
    eyebrow: 'مركز الاتصال',
    ctaLabel: 'تواصل معنا',
  },
  'healthcare-solutions': {
    metaTitle: 'حلول الرعاية الصحية',
    eyebrow: 'حلول دعم الرعاية الصحية',
    heroHeading: 'تعزيز تقديم الرعاية الصحية بتقنيات تفاعل المرضى المتكاملة',
    ctaLabel: 'تواصل معنا',
  },
  'food-and-beverage': {
    metaTitle: 'قطاع الأغذية والمشروبات',
    eyebrow: 'الأغذية والمشروبات',
    heroHeading: 'دفع نمو أعمال الأغذية والمشروبات',
    ctaLabel: 'ابدأ بحلول أذكى',
  },
  'government-public-sector': {
    metaTitle: 'الحكومة والقطاع العام',
    eyebrow: 'الحكومة والقطاع العام',
    heroHeading: 'تمكين الحكومة والقطاع العام',
    ctaLabel: 'شاركنا لحلول حكومية أذكى',
  },
  'insurance-bpo-solutions': {
    metaTitle: 'مركز اتصال التأمين',
    eyebrow: 'مركز اتصال التأمين',
    heroHeading: 'جهّز عمليات التأمين للمستقبل مع باب',
    ctaLabel: 'تواصل معنا',
  },
  'retail-support-solutions': {
    metaTitle: 'حلول دعم التجزئة',
    eyebrow: 'حلول دعم التجزئة',
    heroHeading: 'نمو التجزئة بحلول ذكية وقابلة للتوسع',
    ctaLabel: 'تواصل معنا',
  },
}

export function getLocalizedPage(slug: string, locale: Locale): PageContent | undefined {
  const page = getPage(slug)
  if (!page) return undefined
  if (locale !== 'ar') return page

  const overlay = arOverlays[slug]
  if (!overlay) return page

  return {
    ...page,
    ...overlay,
    impact: overlay.impact ?? page.impact,
  }
}
