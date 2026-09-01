'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { BabLogo } from '@/components/bab-logo'

const navLinks = [
  { href: '/', labelKey: 'navHome' as const },
  { href: '/about-us', labelKey: 'navServices' as const },
  { href: '/articles', labelKey: 'navSolutions' as const },
]

function navClass(active: boolean) {
  return `text-sm font-medium transition-colors hover:text-primary ${
    active ? 'font-semibold text-primary underline decoration-primary decoration-2 underline-offset-8' : 'text-navy/75'
  }`
}

export function LandingHeader() {
  const t = useTranslations('landingPage')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar'
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4 md:gap-4">
        <BabLogo size="sm" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Landing">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navClass(pathname === link.href)}>
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={switchLocale}
            disabled={isPending}
            className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-navy transition hover:border-primary hover:text-primary disabled:opacity-60 sm:px-4 sm:text-sm"
            aria-label={tNav('language')}
          >
            {tNav('language')}
          </button>
          <Link
            href="/contact-us"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 sm:px-5 sm:text-sm"
          >
            {t('headerCta')}
          </Link>
        </div>
      </div>
    </header>
  )
}
