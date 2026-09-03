'use client'

import { useEffect, useState } from 'react'
import Image from '@/components/app-image'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Reveal } from './reveal'
import { usePrefersReducedMotion } from './motion-utils'
import { fetchTestimonials, type ApiTestimonial } from '@/lib/api'
import { HomeRichText } from './home-rich-text'
import type { HomepageLocaleData } from '@/lib/homepage-content'

const fallbackTestimonials: ApiTestimonial[] = [
  {
    quote:
      'Reliable, responsive, and technically strong. The team acted as a true partner, not just a vendor. Their ability to adapt the solution to our needs made a clear difference.',
    name: 'Al Saberyah',
    logoUrl: '/images/clients/alsaberyah.png',
    order: 0,
    active: true,
  },
  {
    quote:
      'Reliable, responsive, and technically strong. The team acted as a true partner, not just a vendor. Their ability to adapt the solution to our needs made a clear difference.',
    name: 'Alya Clinic',
    logoUrl: '/images/clients/alya.png',
    order: 1,
    active: true,
  },
  {
    quote:
      'Reliable, responsive, and technically strong. The team acted as a true partner, not just a vendor. Their ability to adapt the solution to our needs made a clear difference.',
    name: "Chicker's",
    logoUrl: '/images/clients/chickers.jpeg',
    order: 2,
    active: true,
  },
  {
    quote:
      'Our collaboration with BAB has been instrumental in navigating complex project requirements. Their team brings a deep understanding of the Saudi market and a level of professional integrity that is rare to find.',
    name: 'منصة رائز التعليمية',
    logoUrl: '/images/clients/raiza.jpeg',
    order: 3,
    active: true,
  },
  {
    quote:
      'Outstanding support and innovative solutions! They helped us streamline our operations and achieve our goals ahead of schedule.',
    name: 'ملتقى خطوة المهني',
    logoUrl: '/images/clients/asa.jpg',
    order: 4,
    active: true,
  },
  {
    quote:
      "BAB has supported us in enhancing our customer experience through automated response solutions. We've seen a clear improvement in response time, customer satisfaction, and tangible results in engagement and conversion rates.",
    name: 'Sofia Mostafa Abuzaid',
    role: 'Customer Service Manager – Delta Laboratories',
    logoUrl: '/images/clients/delta-labs.jpg',
    order: 5,
    active: true,
  },
  {
    quote:
      'Our experience with BAB helped us connect with Mazaj Maghribi customers faster and smarter through WhatsApp. The solutions provided were simple and effective.',
    name: 'Lama',
    role: 'Marketing Specialist & Customer Service Manager - Mazaj Maghribi',
    logoUrl: '/images/clients/lama.png',
    order: 6,
    active: true,
  },
  {
    quote:
      'Our experience with BAB has been one that truly met our needs as a logistics company focused on customer care and meaningful engagement.',
    name: 'Rima Alshuail',
    role: 'Customer Service Department Lead – Fastlo',
    logoUrl: '/images/clients/logoL.png',
    order: 7,
    active: true,
  },
]

export function TestimonialsSection({
  title,
}: {
  title?: HomepageLocaleData['testimonials']['title']
}) {
  const t = useTranslations('testimonials')
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [items, setItems] = useState<ApiTestimonial[]>(fallbackTestimonials)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    fetchTestimonials(locale).then((data) => {
      if (data?.length) setItems(data)
    })
  }, [locale])

  const active = items[index] ?? items[0]

  const go = (dir: number) => {
    setIndex((prev) => (prev + dir + items.length) % items.length)
  }

  if (!active) return null

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="pb-10 text-center">
          <h2 className="text-3xl font-extrabold text-navy md:text-4xl">
            {title ? (
              <HomeRichText text={title} />
            ) : (
              t.rich('title', {
                accent: (chunks) => <span className="text-primary">{chunks}</span>,
              })
            )}
          </h2>
        </Reveal>

        <Reveal className="mx-auto max-w-3xl text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active._id || active.name + index}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
                <Image src={active.logoUrl} alt={active.name} fill className="object-cover" />
              </div>
              <p className="mt-8 max-w-2xl text-lg italic leading-relaxed text-navy/80 md:text-xl">
                “{active.quote}”
              </p>
              <p className="mt-6 text-base font-bold text-navy">{active.name}</p>
              {active.role ? <p className="mt-1 text-sm text-muted-foreground">{active.role}</p> : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-navy hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-navy hover:bg-muted"
            >
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
