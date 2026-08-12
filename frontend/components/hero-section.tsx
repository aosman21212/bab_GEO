'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from './reveal'
import { HeroMotionBg } from './hero-motion-bg'
import { usePrefersReducedMotion } from './motion-utils'

export function HeroSection() {
  const t = useTranslations('hero')
  const reduced = usePrefersReducedMotion()

  return (
    <section id="home" className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-10 sm:px-6 md:pt-14">
      <HeroMotionBg />

      <div className="relative z-[1] grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-3xl font-extrabold leading-[1.15] text-navy md:text-4xl lg:text-[2.75rem]"
        >
          {t('title')}
        </motion.h1>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <p className="text-pretty leading-relaxed text-muted-foreground">{t('body')}</p>
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

      <div className="relative z-[1] mt-10 grid items-stretch gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <Reveal scaleIn className="relative aspect-[16/10] overflow-hidden rounded-3xl lg:aspect-auto lg:min-h-[420px]">
          <Image
            src="/images/hero-man-phone.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
        </Reveal>

        <Reveal
          delay={0.12}
          className="flex flex-col justify-center gap-4 rounded-3xl border border-border bg-background/90 p-8 shadow-sm backdrop-blur-sm lg:min-h-[420px]"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Image src="/images/clap.png" alt="" width={28} height={28} />
          </span>
          <h3 className="text-xl font-bold text-navy">{t('productivityTitle')}</h3>
          <p className="leading-relaxed text-muted-foreground">{t('productivityBody')}</p>
        </Reveal>
      </div>
    </section>
  )
}
