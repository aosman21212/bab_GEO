'use client'

import { useTranslations } from 'next-intl'
import { ContactForm } from './contact-form'
import { Reveal } from './reveal'
import type { HomepageLocaleData } from '@/lib/homepage-content'

export function CtaContactSection({ content }: { content?: HomepageLocaleData['cta'] }) {
  const t = useTranslations('cta')

  return (
    <section id="project-contact" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 border border-border bg-background p-8 shadow-sm md:grid-cols-2 md:p-12">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight text-navy md:text-4xl">
              {content?.title || t('title')}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {content?.body || t('body')}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
