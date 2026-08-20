import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins, Cairo } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MaintenanceScreen } from '@/components/maintenance-screen'
import {
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildWebSiteJsonLd,
  mergeGeoSettings,
  type GeoSiteSettings,
} from '@/lib/geo-content'
import '../globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    return {
      title: 'BAB International Corp — Seamless Connectivity & Intelligent Solutions',
    }
  }
  setRequestLocale(locale)
  const messages = await getMessages()
  const siteSettings = mergeGeoSettings(
    (messages as { siteSettings?: GeoSiteSettings }).siteSettings,
  )
  const title =
    (locale === 'ar' ? siteSettings.seoTitleAr : siteSettings.seoTitleEn) ||
    'BAB International Corp — Seamless Connectivity & Intelligent Solutions'
  const description =
    (locale === 'ar' ? siteSettings.seoDescriptionAr : siteSettings.seoDescriptionEn) ||
    'Empower your business with seamless connectivity and intelligent solutions.'

  return buildPageMetadata({ locale, title, description })
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const siteSettings = mergeGeoSettings(
    (messages as { siteSettings?: GeoSiteSettings }).siteSettings,
  )
  const maintenance = Boolean(siteSettings.maintenanceMode)
  const loc = locale === 'ar' ? 'ar' : 'en'

  const orgLd = buildOrganizationJsonLd(siteSettings, loc)
  const webLd = buildWebSiteJsonLd(siteSettings, loc)

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${poppins.variable} ${cairo.variable} bg-background`}
      suppressHydrationWarning
    >
      <body
        className={`antialiased ${locale === 'ar' ? 'font-[family-name:var(--font-cairo)]' : 'font-sans'}`}
        suppressHydrationWarning
      >
        {!maintenance ? (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(webLd) }}
            />
          </>
        ) : null}
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col bg-background">
            {maintenance ? (
              <MaintenanceScreen locale={locale} />
            ) : (
              <>
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </>
            )}
          </div>
        </NextIntlClientProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
