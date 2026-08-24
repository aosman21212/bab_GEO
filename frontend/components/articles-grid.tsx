'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/reveal'
import type { ArticleCard } from '@/lib/cms-articles'

export function ArticlesGrid({ articles }: { articles: ArticleCard[] }) {
  const t = useTranslations('articlesPage')

  if (!articles.length) {
    return (
      <Reveal>
        <p className="mx-auto max-w-xl text-center text-muted-foreground">{t('empty')}</p>
      </Reveal>
    )
  }

  return (
    <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <StaggerItem key={article.slug}>
          <Link
            href={`/${article.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-background transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <Image
                src={article.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
              {article.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {article.eyebrow}
                </p>
              ) : null}
              <h2 className="text-lg font-extrabold text-navy md:text-xl">{article.title}</h2>
              {article.summary ? (
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {article.summary}
                </p>
              ) : null}
              <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-primary">
                {t('readMore')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </span>
            </div>
          </Link>
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}
