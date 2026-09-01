'use client'

import Image from '@/components/app-image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/reveal'
import type { SuccessStoryCard } from '@/lib/cms-case-studies'

export function SuccessStoriesGrid({ stories }: { stories: SuccessStoryCard[] }) {
  const t = useTranslations('successStories')

  if (!stories.length) {
    return (
      <Reveal>
        <p className="mx-auto max-w-xl text-center text-muted-foreground">{t('empty')}</p>
      </Reveal>
    )
  }

  return (
    <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StaggerItem key={story.slug}>
          <Link
            href={`/${story.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-background transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <Image
                src={story.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
              {story.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{story.eyebrow}</p>
              ) : null}
              <h2 className="text-lg font-extrabold text-navy md:text-xl">{story.title}</h2>
              {story.summary ? (
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{story.summary}</p>
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
