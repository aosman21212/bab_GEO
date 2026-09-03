import type { Metadata } from 'next'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { HeroSection } from '@/components/hero-section'
import { OurWorksSection } from '@/components/our-works-section'
import { ExperienceSection } from '@/components/experience-section'
import { IndustriesSection } from '@/components/industries-section'
import { TransformationSection } from '@/components/transformation-section'
import { ChannelsSection } from '@/components/channels-section'
import { PartnersSection } from '@/components/partners-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { FaqSection } from '@/components/faq-section'
import { ImpactSection } from '@/components/impact-section'
import { CtaContactSection } from '@/components/cta-contact-section'
import {
  buildFaqPageJsonLd,
  buildPageMetadata,
  faqsForLocale,
  mergeGeoSettings,
  type GeoSiteSettings,
} from '@/lib/geo-content'
import { fetchHomepageContent } from '@/lib/homepage-cms'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const loc = locale === 'ar' ? 'ar' : 'en'
  const [messages, home] = await Promise.all([
    getMessages(),
    fetchHomepageContent(loc),
  ])
  const siteSettings = mergeGeoSettings(
    (messages as { siteSettings?: GeoSiteSettings }).siteSettings,
  )
  const title =
    home.metaTitle ||
    (loc === 'ar' ? siteSettings.seoTitleAr : siteSettings.seoTitleEn) ||
    'BAB International Corp'
  const description =
    home.metaDescription ||
    (loc === 'ar' ? siteSettings.seoDescriptionAr : siteSettings.seoDescriptionEn) ||
    'Empower your business with seamless connectivity and intelligent solutions.'

  return buildPageMetadata({
    locale,
    title,
    description,
    path: '',
    absoluteTitle: true,
  })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const loc = locale === 'ar' ? 'ar' : 'en'
  const [messages, home] = await Promise.all([
    getMessages(),
    fetchHomepageContent(loc),
  ])
  const siteSettings = mergeGeoSettings(
    (messages as { siteSettings?: GeoSiteSettings }).siteSettings,
  )
  const faqs = home.faq.items.length ? home.faq.items : faqsForLocale(siteSettings, loc)
  const faqLd = buildFaqPageJsonLd(faqs)

  return (
    <>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <HeroSection content={home.hero} />
      <OurWorksSection title={home.works.title} />
      <ExperienceSection works={home.works} experience={home.experience} />
      <IndustriesSection industries={home.industries} stats={home.stats} />
      <TransformationSection content={home.transformation} />
      <ChannelsSection content={home.channels} />
      <PartnersSection content={home.partners} />
      <TestimonialsSection title={home.testimonials.title} />
      <FaqSection faqs={faqs} eyebrow={home.faq.eyebrow} title={home.faq.title} />
      <ImpactSection content={home.impact} />
      <CtaContactSection content={home.cta} />
    </>
  )
}
