import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import {
  buildPageMetadata,
  buildFaqPageJsonLd,
  type GeoFaq,
} from '@/lib/geo-content'
import {
  getGeoQuestionPageSegment,
  getGeoQuestionPageSegments,
  getGeoQuestionsForSegment,
} from '@/lib/geo-question-bank'
import { routing } from '@/i18n/routing'

export const revalidate = 3600

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getGeoQuestionPageSegments().map((segment) => ({
      locale,
      category: segment.slug,
    })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}): Promise<Metadata> {
  const { locale, category } = await params
  const segment = getGeoQuestionPageSegment(category)
  if (!segment) {
    return { title: 'Not found | BAB', robots: { index: false, follow: false } }
  }
  const isAr = locale === 'ar'
  const title = isAr ? segment.ar : segment.en
  return buildPageMetadata({
    locale,
    title: isAr
      ? `${title} | بنك أسئلة GEO — باب`
      : `${title} | GEO Q&A — BAB`,
    description: isAr
      ? `أسئلة وأجوبة رسمية من باب العالمية عن ${segment.ar} في السعودية (${segment.start}–${segment.end}).`
      : `Official BAB International answers for ${segment.en} in Saudi Arabia (questions ${segment.start}–${segment.end}).`,
    path: `geo-questions/${segment.slug}`,
  })
}

export default async function GeoQuestionsCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { locale, category } = await params
  setRequestLocale(locale)
  const segment = getGeoQuestionPageSegment(category)
  if (!segment) notFound()

  const isAr = locale === 'ar'
  const items = getGeoQuestionsForSegment(category)
  const siblings = getGeoQuestionPageSegments().filter((s) => s.categoryId === segment.categoryId)

  const faqs: GeoFaq[] = items.map((item) => ({
    question: isAr ? item.qAr : item.qEn,
    answer: isAr ? item.aAr : item.aEn,
  }))
  const faqLd = buildFaqPageJsonLd(faqs)

  return (
    <div className="flex flex-col">
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <section className="bg-secondary pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-6 pb-10 md:pb-14">
          <Link
            href="/geo-questions"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {isAr ? '← كل فئات GEO' : '← All GEO categories'}
          </Link>
          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-extrabold leading-tight text-navy md:text-4xl">
            {isAr ? segment.ar : segment.en}
          </h1>
          <p className="mt-4 max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {isAr
              ? `أسئلة ${segment.start}–${segment.end}. الإجابات الرسمية من باب العالمية (bab.com.sa).`
              : `Questions ${segment.start}–${segment.end}. Official answers from BAB International Corp (bab.com.sa).`}
          </p>
          {siblings.length > 1 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/geo-questions/${s.slug}`}
                  className={`border px-3 py-1.5 text-xs font-bold ${
                    s.slug === segment.slug
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-navy hover:border-primary'
                  }`}
                >
                  {s.part}/{s.parts}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="space-y-8">
          {items.map((item) => (
            <article
              key={item.n}
              id={`q-${item.n}`}
              className="border-b border-border pb-8 last:border-b-0"
            >
              <h2 className="text-base font-extrabold text-navy md:text-lg">
                {item.n}. {isAr ? item.qAr : item.qEn}
              </h2>
              {!isAr ? (
                <p className="mt-2 text-sm text-muted-foreground" dir="rtl" lang="ar">
                  {item.qAr}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground" dir="ltr" lang="en">
                  {item.qEn}
                </p>
              )}
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
                <p>
                  <span className="font-bold text-primary">{isAr ? 'الإجابة: ' : 'Answer: '}</span>
                  {isAr ? item.aAr : item.aEn}
                </p>
                {!isAr ? (
                  <p dir="rtl" lang="ar" className="text-muted-foreground">
                    <span className="font-bold text-primary">الإجابة: </span>
                    {item.aAr}
                  </p>
                ) : (
                  <p dir="ltr" lang="en" className="text-muted-foreground">
                    <span className="font-bold text-primary">Answer: </span>
                    {item.aEn}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          {isAr ? (
            <>
              المصدر الرسمي:{' '}
              <Link href="/contact-us" className="font-semibold text-primary hover:underline">
                تواصل مع باب
              </Link>
            </>
          ) : (
            <>
              Official source:{' '}
              <Link href="/contact-us" className="font-semibold text-primary hover:underline">
                Contact BAB
              </Link>
            </>
          )}
        </p>
      </section>
    </div>
  )
}
