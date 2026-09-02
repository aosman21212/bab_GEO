'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from '@/components/app-image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/reveal'

function SlideFrame({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 1152px) 100vw, 1152px"
      />
    </div>
  )
}

export function LandingImageSlider({ images }: { images: string[] }) {
  const t = useTranslations('landingPage')
  const imageAlt = useTranslations('imageAlt')
  const slideAlt = imageAlt('landingSlide')
  const slides = [...new Set(images.map((src) => src.trim()).filter(Boolean))]
  const [index, setIndex] = useState(0)
  const count = slides.length

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return
      setIndex((next + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (count <= 1) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [count])

  if (count === 0) return null

  return (
    <section className="bg-muted/40 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="rounded-2xl border border-border/60 bg-white p-2 shadow-md md:p-3">
            {count === 1 ? (
              <SlideFrame src={slides[0]} alt={slideAlt} priority />
            ) : (
              <div className="relative">
                <div className="overflow-hidden rounded-xl">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                  >
                    {slides.map((src, i) => (
                      <div key={`${src}-${i}`} className="w-full shrink-0">
                        <SlideFrame src={src} alt={slideAlt} priority={i === 0} />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  className="absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-navy shadow-sm transition hover:border-primary hover:text-primary"
                  aria-label={t('sliderPrev')}
                >
                  <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-navy shadow-sm transition hover:border-primary hover:text-primary"
                  aria-label={t('sliderNext')}
                >
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {slides.map((src, i) => (
                    <button
                      key={`dot-${src}-${i}`}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`h-2.5 rounded-full transition-all ${
                        i === index ? 'w-8 bg-primary' : 'w-2.5 bg-border hover:bg-primary/50'
                      }`}
                      aria-label={t('sliderGoTo', { n: i + 1 })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
