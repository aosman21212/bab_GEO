'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Reveal } from './reveal'
import type { GeoFaq } from '@/lib/geo-content'

export function FaqSection({ faqs }: { faqs: GeoFaq[] }) {
  const t = useTranslations('faq')
  const [open, setOpen] = useState(0)

  if (!faqs.length) return null

  return (
    <section className="py-16 md:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('eyebrow')}</p>
          <h2 id="faq-heading" className="mt-2 text-3xl font-extrabold text-navy md:text-4xl">
            {t('title')}
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={`${item.question}-${i}`} delay={i * 0.04}>
                <div>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-start justify-between gap-4 py-5 text-start"
                  >
                    <span className="text-base font-semibold text-navy md:text-lg">{item.question}</span>
                    <ChevronDown
                      className={`mt-1 h-5 w-5 shrink-0 text-primary transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
