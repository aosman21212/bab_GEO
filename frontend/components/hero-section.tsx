'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from './reveal'
import { HeroMotionBg } from './hero-motion-bg'
import { usePrefersReducedMotion } from './motion-utils'

const slides = ['/images/hero-man-phone.png', '/images/support-headset.png'] as const

function HeroImageCarousel() {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduced || paused) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => window.clearInterval(id)
  }, [reduced, paused])

  return (
    <div
      className="group relative z-[1] mt-10 overflow-hidden rounded-[1.75rem] md:mt-12"
      dir="ltr"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] min-h-[280px] w-full md:min-h-[420px]">
        {slides.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? 'z-[1] opacity-100' : 'z-0 opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/25 via-transparent to-transparent" />
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5 sm:bottom-4">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-primary' : 'w-1.5 bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const t = useTranslations('hero')
  const reduced = usePrefersReducedMotion()

  return (
    <section id="home" className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-10 sm:px-6 md:pt-14">
      <HeroMotionBg />

      <div className="relative z-[1] grid items-start gap-6 lg:grid-cols-2 lg:gap-16">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-3xl font-extrabold leading-[1.12] text-navy md:text-4xl lg:text-[2.85rem]"
        >
          {t('title')}
        </motion.h1>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-5 lg:pt-1"
        >
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
            {t('body')}
          </p>
          <Link
            href="/contact-us"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-border bg-background py-1.5 pe-1.5 ps-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-sm font-semibold text-primary">{t('cta')}</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </span>
          </Link>
        </motion.div>
      </div>

      <Reveal scaleIn>
        <HeroImageCarousel />
      </Reveal>
    </section>
  )
}
