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
  faqsForLocale,
  mergeGeoSettings,
  type GeoSiteSettings,
} from '@/lib/geo-content'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const messages = await getMessages()
  const siteSettings = mergeGeoSettings(
    (messages as { siteSettings?: GeoSiteSettings }).siteSettings,
  )
  const loc = locale === 'ar' ? 'ar' : 'en'
  const faqs = faqsForLocale(siteSettings, loc)
  const faqLd = buildFaqPageJsonLd(faqs)

  return (
    <>
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <HeroSection />
      <OurWorksSection />
      <ExperienceSection />
      <IndustriesSection />
      <TransformationSection />
      <ChannelsSection />
      <PartnersSection />
      <TestimonialsSection />
      <FaqSection faqs={faqs} />
      <ImpactSection />
      <CtaContactSection />
    </>
  )
}
