import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { InnerPage } from '@/components/inner-page'
import { allPages } from '@/lib/site-content'
import { fetchCmsPage } from '@/lib/cms-pages'
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
  return {
    title: `${page.metaTitle} — BAB International Corp`,
    description: page.metaDescription,
  }
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
  return <InnerPage page={page} />
}
