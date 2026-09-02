import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildPageMetadata } from '@/lib/geo-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'legal' })
  return buildPageMetadata({
    locale,
    title: t('termsMetaTitle'),
    description: t('termsMetaDescription'),
    path: 'terms-conditions',
  })
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children
}
