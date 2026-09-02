import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { InnerPage } from '@/components/inner-page'
import { LandingPage } from '@/components/landing-page'
import { allPages } from '@/lib/site-content'
import { fetchCmsPage } from '@/lib/cms-pages'
import { buildPageMetadata } from '@/lib/geo-content'
import { getGaMeasurementId } from '@/lib/analytics'
import { routing, type Locale } from '@/i18n/routing'

export const revalidate = 60

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    allPages.map((page) => ({ locale, slug: page.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const page = await fetchCmsPage(slug, locale as Locale)
  if (!page) return {}
  return buildPageMetadata({
    locale,
    title: `${page.metaTitle} — BAB International Corp`,
    description: page.metaDescription,
    path: slug,
  })
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const page = await fetchCmsPage(slug, locale as Locale)
  if (!page) notFound()
  if (page.category === 'landing' && page.landingType) {
    return (
      <LandingPage
        page={page}
        landingType={page.landingType}
        gaMeasurementId={getGaMeasurementId()}
      />
    )
  }
  return <InnerPage page={page} />
}
