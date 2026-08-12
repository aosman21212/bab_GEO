'use client'

import { useTranslations } from 'next-intl'
import { ContactForm } from './contact-form'
import { Reveal } from './reveal'

export function CtaContactSection() {
  const t = useTranslations('cta')

  return (
    <section id="project-contact" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 border border-border bg-background p-8 shadow-sm md:grid-cols-2 md:p-12">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight text-navy md:text-4xl">{t('title')}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t('body')}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
