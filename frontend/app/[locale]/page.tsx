import { setRequestLocale } from 'next-intl/server'
import { HeroSection } from '@/components/hero-section'
import { OurWorksSection } from '@/components/our-works-section'
import { ExperienceSection } from '@/components/experience-section'
import { IndustriesSection } from '@/components/industries-section'
import { TransformationSection } from '@/components/transformation-section'
import { ChannelsSection } from '@/components/channels-section'
import { PartnersSection } from '@/components/partners-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { ImpactSection } from '@/components/impact-section'
import { CtaContactSection } from '@/components/cta-contact-section'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <HeroSection />
      <OurWorksSection />
      <ExperienceSection />
      <IndustriesSection />
      <TransformationSection />
      <ChannelsSection />
      <PartnersSection />
      <TestimonialsSection />
      <ImpactSection />
      <CtaContactSection />
    </>
  )
}
