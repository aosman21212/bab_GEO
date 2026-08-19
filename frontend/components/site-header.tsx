'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { solutionGroups } from '@/lib/nav-tree'
import {
  emptyCmsNavExtras,
  fetchCmsNavExtras,
  type CmsNavExtras,
  type CmsNavLink,
} from '@/lib/cms-nav'
import { BabLogo } from './bab-logo'

const menuSlides = [
  '/images/bab-technology.png',
  '/images/bab-hero.png',
  '/images/network-sphere.png',
  '/images/bab-telecom.png',
] as const

const SPAM_PDF = 'https://bab.com.sa/wp-content/uploads/2025/07/ar_spam_policy.pdf'

function navLinkClass(active: boolean) {
  return `text-[13px] font-medium tracking-wide transition-colors hover:text-primary md:text-sm ${
    active ? 'text-primary font-semibold' : 'text-navy/75'
  }`
}

export function SiteHeader() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [mobileSolutions, setMobileSolutions] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [cmsExtras, setCmsExtras] = useState<CmsNavExtras>(emptyCmsNavExtras)

  useEffect(() => {
    let cancelled = false
    fetchCmsNavExtras(locale).then((extras) => {
      if (!cancelled) setCmsExtras(extras)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    if (!solutionsOpen) return
    const id = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % menuSlides.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [solutionsOpen])

  const menuGroups = useMemo(() => {
    return solutionGroups
      .map((group) => {
        let extras: CmsNavLink[] = []
        if (group.labelKey === 'solutionsGroup') extras = cmsExtras.solutions
        if (group.labelKey === 'callCenterGroup') extras = cmsExtras.industries
        if (group.labelKey === 'productsGroup') extras = cmsExtras.products
        if (group.labelKey === 'caseStudiesGroup') extras = cmsExtras.caseStudies
        return { ...group, extras }
      })
      .filter((group) => group.items.length > 0 || group.extras.length > 0)
  }, [cmsExtras])

  const mobileLinks = useMemo(() => {
    const staticItems = solutionGroups.flatMap((g) =>
      g.items.map((item) => ({ href: item.href, label: t(item.labelKey as 'omnichannel') })),
    )
    const dynamicItems = [
      ...cmsExtras.solutions,
      ...cmsExtras.industries,
      ...cmsExtras.products,
      ...cmsExtras.caseStudies,
    ].map((item) => ({
      href: item.href,
      label: item.label,
    }))
    return [...staticItems, ...dynamicItems]
  }, [cmsExtras, t])

  const switchLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar'
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  const isHome = pathname === '/'

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-border bg-background/90 px-3 py-2 shadow-sm backdrop-blur-md md:gap-4 md:px-5 md:py-2">
        <BabLogo size="sm" />

        <nav className="hidden items-center gap-5 xl:flex">
          <Link href="/" className={navLinkClass(isHome)}>
            {t('home')}
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-1 ${navLinkClass(false)}`}
            >
              {t('solutions')}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {solutionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full z-50 w-[min(920px,92vw)] -translate-x-1/2 pt-3"
                >
                  <div
                    className="grid gap-3 rounded-2xl border border-border bg-background p-4 shadow-xl"
                    style={{
                      gridTemplateColumns: `minmax(160px,1.1fr) repeat(${menuGroups.length}, minmax(120px,1fr))`,
                    }}
                  >
                    <div className="relative min-h-[220px] overflow-hidden rounded-xl bg-muted">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={menuSlides[slideIndex]}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={menuSlides[slideIndex]}
                            alt=""
                            fill
                            sizes="240px"
                            className="object-cover"
                            priority={false}
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
                        {menuSlides.map((src, i) => (
                          <button
                            key={src}
                            type="button"
                            aria-label={`Slide ${i + 1}`}
                            onClick={() => setSlideIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              i === slideIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {menuGroups.map((group) => (
                      <div key={group.labelKey}>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
                          {t(group.labelKey)}
                        </p>
                        <ul className="flex flex-col gap-1">
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="block rounded-xl px-2 py-1.5 text-sm text-navy/80 transition-colors hover:bg-muted hover:text-primary"
                              >
                                {t(item.labelKey)}
                              </Link>
                            </li>
                          ))}
                          {group.extras.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="block rounded-xl px-2 py-1.5 text-sm text-navy/80 transition-colors hover:bg-muted hover:text-primary"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/about-us" className={navLinkClass(pathname === '/about-us')}>
            {t('about')}
          </Link>
          <a
            href={SPAM_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkClass(false)}
          >
            {t('spamPolicy')}
          </a>
          <button
            type="button"
            onClick={switchLocale}
            disabled={isPending}
            dir={locale === 'ar' ? 'ltr' : 'rtl'}
            style={locale === 'en' ? { fontFamily: 'var(--font-cairo)' } : undefined}
            className={navLinkClass(false)}
          >
            {t('language')}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact-us"
            className="hidden rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground transition-transform hover:scale-[1.03] md:inline-flex md:text-sm"
          >
            {t('contact')}
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-h-[75vh] max-w-7xl overflow-y-auto rounded-3xl border border-border bg-background p-4 shadow-lg xl:hidden"
          >
            <nav className="flex flex-col">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={`border-b border-border/60 py-3 text-sm font-semibold ${isHome ? 'text-primary' : 'text-navy/80'}`}
              >
                {t('home')}
              </Link>
              <button
                type="button"
                onClick={() => setMobileSolutions((v) => !v)}
                className="flex w-full items-center justify-between border-b border-border/60 py-3 text-sm font-semibold text-navy/80"
              >
                {t('solutions')}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${mobileSolutions ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileSolutions && (
                <div className="border-b border-border/60 bg-muted/50 py-2 ps-3">
                  {mobileLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-sm text-navy/70 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/about-us"
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-semibold text-navy/80"
              >
                {t('about')}
              </Link>
              <a
                href={SPAM_PDF}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-semibold text-navy/80"
              >
                {t('spamPolicy')}
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  switchLocale()
                }}
                className="border-b border-border/60 py-3 text-start text-sm font-semibold text-navy/80"
              >
                {t('language')}
              </button>
              <Link
                href="/contact-us"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                {t('contact')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
