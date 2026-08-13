'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Reveal } from './reveal'

const BOOK_DEMO_WHATSAPP =
  'https://api.whatsapp.com/send?phone=966920035161&text=Book+a+demo'

const industryMeta = [
  { id: 'food', image: '/images/industries/food.png' },
  { id: 'government', image: '/images/industries/government.png' },
  { id: 'healthcare', image: '/images/industries/healthcare.png' },
  { id: 'insurance', image: '/images/industries/insurance.png' },
  { id: 'retail', image: '/images/industries/retail.png' },
] as const

export function IndustriesSection() {
  const t = useTranslations('industries')
  const [active, setActive] = useState<(typeof industryMeta)[number]['id']>('food')
  const current = industryMeta.find((i) => i.id === active) ?? industryMeta[0]

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold text-primary">{t('eyebrow')}</span>
          <h2 className="mt-2 text-3xl font-extrabold text-navy md:text-4xl">{t('title')}</h2>
        </Reveal>

        <Reveal className="mt-8">
          <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-1">
            {industryMeta.map((item) => {
              const isActive = item.id === active
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`-mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-navy'
                  }`}
                >
                  {t(`${item.id}.tab`)}
                </button>
              )
            })}
          </div>
        </Reveal>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid items-center gap-10 lg:grid-cols-2"
            >
              <div>
                <h3 className="text-2xl font-extrabold text-navy">{t(`${current.id}.title`)}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{t(`${current.id}.body`)}</p>
                <a
                  href={BOOK_DEMO_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {t('bookDemo')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </a>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative h-64 w-64 overflow-hidden rounded-full grayscale md:h-80 md:w-80">
                  <Image
                    src={current.image}
                    alt={t(`${current.id}.title`)}
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
