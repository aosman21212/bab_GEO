import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <p className="text-sm font-bold tracking-[0.16em] text-primary">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy md:text-4xl">{t('title')}</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{t('body')}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        {t('home')}
      </Link>
    </section>
  )
}
