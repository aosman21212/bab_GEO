import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/reveal'
import { SuccessStoriesGrid } from '@/components/success-stories-grid'
import { fetchSuccessStories } from '@/lib/cms-case-studies'
import { buildPageMetadata } from '@/lib/geo-content'
import type { Locale } from '@/i18n/routing'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'successStories' })
  return buildPageMetadata({
    locale,
    title: `${t('metaTitle')} — BAB International Corp`,
    description: t('metaDescription'),
    path: 'success-stories',
  })
}

export default async function SuccessStoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('successStories')
  const stories = await fetchSuccessStories(locale as Locale)

  return (
    <div className="flex flex-col">
      <section className="bg-secondary pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 md:pb-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('eyebrow')}</p>
            <h1 className="mt-2 max-w-3xl text-balance text-3xl font-extrabold leading-tight text-navy md:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{t('body')}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SuccessStoriesGrid stories={stories} />
        </div>
      </section>
    </div>
  )
}
