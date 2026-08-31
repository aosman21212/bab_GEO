'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload } from 'lucide-react'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { AdminImagePicker } from '@/components/admin-image-picker'
import type { PageCategory, LandingType } from '@/lib/page-categories'

export type FeatureCardForm = {
  accent: string
  title: string
  pointsText: string
}

export type BenefitForm = {
  title: string
  desc: string
}

export type LocaleFormData = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  heroHeading: string
  heroDescription: string
  ctaLabel: string
  image: string
  impactHeading: string
  impactText: string
  featuresEnabled: boolean
  featuresEyebrow: string
  featuresHeading: string
  featureCards: FeatureCardForm[]
  benefitsEnabled: boolean
  benefitsHeading: string
  benefits: BenefitForm[]
  useCasesEnabled: boolean
  useCasesHeading: string
  useCasesText: string
  highlightsText: string
  formNote: string
  whatsappDisplayName: string
  whatsappPhone: string
  officialWebsite: string
  officialEmail: string
  profileDescription: string
}

export type PageMetaForm = {
  slug: string
  category: PageCategory
  status: 'published' | 'draft'
  landingType?: LandingType
}

export function emptyLocaleForm(partial?: Partial<LocaleFormData>): LocaleFormData {
  return {
    metaTitle: '',
    metaDescription: '',
    eyebrow: '',
    heroHeading: '',
    heroDescription: '',
    ctaLabel: 'Contact Us',
    image: '/images/bab-hero.png',
    impactHeading: '',
    impactText: '',
    featuresEnabled: false,
    featuresEyebrow: '',
    featuresHeading: '',
    featureCards: [],
    benefitsEnabled: false,
    benefitsHeading: '',
    benefits: [],
    useCasesEnabled: false,
    useCasesHeading: '',
    useCasesText: '',
    highlightsText: '',
    formNote: '',
    whatsappDisplayName: '',
    whatsappPhone: '',
    officialWebsite: '',
    officialEmail: '',
    profileDescription: '',
    ...partial,
  }
}

export function localeFromApi(raw: Record<string, unknown> | undefined | null): LocaleFormData {
  if (!raw) return emptyLocaleForm()

  const features = raw.features as
    | { eyebrow?: string; heading?: string; cards?: { accent?: string; title?: string; points?: string[] }[] }
    | undefined
  const benefits = raw.benefits as
    | { heading?: string; items?: { title?: string; desc?: string }[] }
    | undefined
  const useCases = raw.useCases as { heading?: string; items?: string[] } | undefined
  const impact = raw.impact as { heading?: string; text?: string } | undefined

  return emptyLocaleForm({
    metaTitle: String(raw.metaTitle ?? ''),
    metaDescription: String(raw.metaDescription ?? ''),
    eyebrow: String(raw.eyebrow ?? ''),
    heroHeading: String(raw.heroHeading ?? ''),
    heroDescription: String(raw.heroDescription ?? ''),
    ctaLabel: String(raw.ctaLabel ?? 'Contact Us'),
    image: String(raw.image ?? '/images/bab-hero.png'),
    impactHeading: String(impact?.heading ?? ''),
    impactText: String(impact?.text ?? ''),
    featuresEnabled: Boolean(features),
    featuresEyebrow: String(features?.eyebrow ?? ''),
    featuresHeading: String(features?.heading ?? ''),
    featureCards: (features?.cards ?? []).map((c) => ({
      accent: String(c.accent ?? ''),
      title: String(c.title ?? ''),
      pointsText: (c.points ?? []).join('\n'),
    })),
    benefitsEnabled: Boolean(benefits),
    benefitsHeading: String(benefits?.heading ?? ''),
    benefits: (benefits?.items ?? []).map((b) => ({
      title: String(b.title ?? ''),
      desc: String(b.desc ?? ''),
    })),
    useCasesEnabled: Boolean(useCases),
    useCasesHeading: String(useCases?.heading ?? ''),
    useCasesText: (useCases?.items ?? []).join('\n'),
    highlightsText: Array.isArray(raw.highlights)
      ? (raw.highlights as string[]).join('\n')
      : '',
    formNote: String(raw.formNote ?? ''),
    whatsappDisplayName: String(raw.whatsappDisplayName ?? ''),
    whatsappPhone: String(raw.whatsappPhone ?? ''),
    officialWebsite: String(raw.officialWebsite ?? ''),
    officialEmail: String(raw.officialEmail ?? ''),
    profileDescription: String(raw.profileDescription ?? ''),
  })
}

export function localeToApi(form: LocaleFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    eyebrow: form.eyebrow,
    heroHeading: form.heroHeading,
    heroDescription: form.heroDescription,
    ctaLabel: form.ctaLabel,
    image: form.image,
    highlights: form.highlightsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
    formNote: form.formNote,
    whatsappDisplayName: form.whatsappDisplayName,
    whatsappPhone: form.whatsappPhone,
    officialWebsite: form.officialWebsite,
    officialEmail: form.officialEmail,
    profileDescription: form.profileDescription,
    impact: {
      heading: form.impactHeading,
      text: form.impactText,
    },
  }

  if (form.featuresEnabled) {
    payload.features = {
      eyebrow: form.featuresEyebrow,
      heading: form.featuresHeading,
      cards: form.featureCards.map((c) => ({
        accent: c.accent,
        title: c.title,
        points: c.pointsText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      })),
    }
  }

  if (form.benefitsEnabled) {
    payload.benefits = {
      heading: form.benefitsHeading,
      items: form.benefits.map((b) => ({ title: b.title, desc: b.desc })),
    }
  }

  if (form.useCasesEnabled) {
    payload.useCases = {
      heading: form.useCasesHeading,
      items: form.useCasesText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    }
  }

  return payload
}

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:bg-white'
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-navy">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function Label({
  label,
  children,
  dir,
}: {
  label: string
  children: ReactNode
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy" dir={dir}>
      {label}
      {children}
    </label>
  )
}

export function AdminPageForm({
  locale,
  meta,
  onMetaChange,
  value,
  onChange,
  slugEditable = false,
}: {
  locale: 'en' | 'ar'
  meta: PageMetaForm
  onMetaChange: (meta: PageMetaForm) => void
  value: LocaleFormData
  onChange: (value: LocaleFormData) => void
  slugEditable?: boolean
}) {
  const { t } = useAdminLocale()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const isLanding = meta.category === 'landing'
  const landingType = meta.landingType || 'lead-form'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const set = <K extends keyof LocaleFormData>(key: K, v: LocaleFormData[K]) => {
    onChange({ ...value, [key]: v })
  }

  return (
    <div className="space-y-6">
      <Card title={t('pageForm.page')} subtitle={t('pageForm.pageSubtitle')}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Label label={t('common.slug')}>
            <input
              className={`${fieldClass()} font-mono`}
              value={meta.slug}
              disabled={!slugEditable}
              onChange={(e) =>
                onMetaChange({
                  ...meta,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/^-|-$/g, ''),
                })
              }
              required
            />
          </Label>
          <Label label={t('common.type')}>
            <select
              className={fieldClass()}
              value={meta.category}
              onChange={(e) => {
                const category = e.target.value as PageCategory
                onMetaChange({
                  ...meta,
                  category,
                  landingType: category === 'landing' ? meta.landingType || 'lead-form' : undefined,
                })
              }}
            >
              <option value="solution">{t('common.solution')}</option>
              <option value="industry">{t('common.industry')}</option>
              <option value="product">{t('common.product')}</option>
              <option value="case-study">{t('common.caseStudy')}</option>
              <option value="article">{t('common.article')}</option>
              <option value="landing">{t('common.landing')}</option>
            </select>
          </Label>
          {isLanding ? (
            <Label label={t('pageForm.landingLayout')}>
              <select
                className={fieldClass()}
                value={landingType}
                onChange={(e) =>
                  onMetaChange({ ...meta, landingType: e.target.value as LandingType })
                }
              >
                <option value="lead-form">{t('pageForm.landingLeadForm')}</option>
                <option value="whatsapp">{t('pageForm.landingWhatsApp')}</option>
              </select>
            </Label>
          ) : (
            <Label label={t('common.status')}>
              <select
                className={fieldClass()}
                value={meta.status}
                onChange={(e) =>
                  onMetaChange({ ...meta, status: e.target.value as 'published' | 'draft' })
                }
              >
                <option value="published">{t('common.published')}</option>
                <option value="draft">{t('common.draft')}</option>
              </select>
            </Label>
          )}
          {isLanding ? (
            <Label label={t('common.status')}>
              <select
                className={fieldClass()}
                value={meta.status}
                onChange={(e) =>
                  onMetaChange({ ...meta, status: e.target.value as 'published' | 'draft' })
                }
              >
                <option value="published">{t('common.published')}</option>
                <option value="draft">{t('common.draft')}</option>
              </select>
            </Label>
          ) : null}
        </div>
      </Card>

      <Card
        title={t('pageForm.seo')}
        subtitle={t('pageForm.seoSubtitle', { locale: locale.toUpperCase() })}
      >
        <Label label={t('pageForm.metaTitle')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.metaTitle}
            onChange={(e) => set('metaTitle', e.target.value)}
          />
        </Label>
        <Label label={t('pageForm.metaDescription')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[88px] resize-y`}
            value={value.metaDescription}
            onChange={(e) => set('metaDescription', e.target.value)}
          />
        </Label>
      </Card>

      <Card title={t('pageForm.hero')} subtitle={t('pageForm.heroSubtitle')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label label={t('pageForm.eyebrow')} dir={dir}>
            <input
              className={fieldClass()}
              value={value.eyebrow}
              onChange={(e) => set('eyebrow', e.target.value)}
            />
          </Label>
          <Label label={t('pageForm.ctaLabel')} dir={dir}>
            <input
              className={fieldClass()}
              value={value.ctaLabel}
              onChange={(e) => set('ctaLabel', e.target.value)}
            />
          </Label>
        </div>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.heroHeading}
            onChange={(e) => set('heroHeading', e.target.value)}
          />
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[100px] resize-y`}
            value={value.heroDescription}
            onChange={(e) => set('heroDescription', e.target.value)}
          />
        </Label>
        <Label label={t('pageForm.heroImage')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative h-28 w-full max-w-[200px] overflow-hidden rounded-xl border border-border bg-muted">
              {value.image ? (
                <Image
                  src={value.image}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  {t('pageForm.noImage')}
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <AdminImagePicker
                disabled={uploading}
                onUploadingChange={setUploading}
                onError={setUploadError}
                onUploaded={(url) => {
                  setUploadError(null)
                  set('image', url)
                }}
                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
              >
                <Upload className="h-4 w-4 text-primary" />
                {uploading ? t('common.uploading') : t('pageForm.uploadImage')}
              </AdminImagePicker>
              <input
                className={`${fieldClass()} font-mono`}
                value={value.image}
                onChange={(e) => set('image', e.target.value)}
                placeholder="/images/bab-hero.png"
              />
              {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
              <p className="text-xs text-muted-foreground">{t('pageForm.imageHint')}</p>
            </div>
          </div>
        </Label>
      </Card>

      {isLanding ? (
        <Card title={t('pageForm.landingContent')} subtitle={t('pageForm.landingContentSubtitle')}>
          <Label label={t('pageForm.highlights')} dir={dir}>
            <textarea
              className={`${fieldClass()} min-h-[120px] resize-y`}
              value={value.highlightsText}
              onChange={(e) => set('highlightsText', e.target.value)}
              placeholder={t('pageForm.highlightsPlaceholder')}
            />
          </Label>
          {landingType === 'lead-form' ? (
            <Label label={t('pageForm.formNote')} dir={dir}>
              <input
                className={fieldClass()}
                value={value.formNote}
                onChange={(e) => set('formNote', e.target.value)}
              />
            </Label>
          ) : (
            <>
              <Label label={t('pageForm.whatsappDisplayName')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.whatsappDisplayName}
                  onChange={(e) => set('whatsappDisplayName', e.target.value)}
                />
              </Label>
              <Label label={t('pageForm.whatsappPhone')}>
                <input
                  className={fieldClass()}
                  value={value.whatsappPhone}
                  onChange={(e) => set('whatsappPhone', e.target.value)}
                  placeholder="966920035161"
                />
              </Label>
              <Label label={t('pageForm.officialWebsite')}>
                <input
                  className={fieldClass()}
                  value={value.officialWebsite}
                  onChange={(e) => set('officialWebsite', e.target.value)}
                />
              </Label>
              <Label label={t('pageForm.officialEmail')}>
                <input
                  className={fieldClass()}
                  value={value.officialEmail}
                  onChange={(e) => set('officialEmail', e.target.value)}
                />
              </Label>
              <Label label={t('pageForm.profileDescription')} dir={dir}>
                <textarea
                  className={`${fieldClass()} min-h-[100px] resize-y`}
                  value={value.profileDescription}
                  onChange={(e) => set('profileDescription', e.target.value)}
                />
              </Label>
            </>
          )}
        </Card>
      ) : null}

      {!isLanding ? (
        <>
      <Card title={t('pageForm.impact')} subtitle={t('pageForm.impactSubtitle')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.impactHeading}
            onChange={(e) => set('impactHeading', e.target.value)}
          />
        </Label>
        <Label label={t('pageForm.text')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[88px] resize-y`}
            value={value.impactText}
            onChange={(e) => set('impactText', e.target.value)}
          />
        </Label>
      </Card>

      <Card title={t('pageForm.features')}>
        <label className="flex items-center gap-3 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={value.featuresEnabled}
            onChange={(e) => set('featuresEnabled', e.target.checked)}
            className="accent-[var(--primary)]"
          />
          {t('pageForm.enableFeatures')}
        </label>
        {value.featuresEnabled ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Label label={t('pageForm.eyebrow')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.featuresEyebrow}
                  onChange={(e) => set('featuresEyebrow', e.target.value)}
                />
              </Label>
              <Label label={t('pageForm.heading')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.featuresHeading}
                  onChange={(e) => set('featuresHeading', e.target.value)}
                />
              </Label>
            </div>
            <div className="space-y-4">
              {value.featureCards.map((card, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-muted/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-navy">
                      {t('pageForm.card', { n: idx + 1 })}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                      onClick={() =>
                        set(
                          'featureCards',
                          value.featureCards.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Label label={t('pageForm.accent')} dir={dir}>
                      <input
                        className={fieldClass()}
                        value={card.accent}
                        onChange={(e) => {
                          const next = [...value.featureCards]
                          next[idx] = { ...card, accent: e.target.value }
                          set('featureCards', next)
                        }}
                      />
                    </Label>
                    <Label label={t('common.title')} dir={dir}>
                      <input
                        className={fieldClass()}
                        value={card.title}
                        onChange={(e) => {
                          const next = [...value.featureCards]
                          next[idx] = { ...card, title: e.target.value }
                          set('featureCards', next)
                        }}
                      />
                    </Label>
                  </div>
                  <div className="mt-3">
                    <Label label={t('pageForm.points')} dir={dir}>
                      <textarea
                        className={`${fieldClass()} min-h-[88px] resize-y`}
                        value={card.pointsText}
                        onChange={(e) => {
                          const next = [...value.featureCards]
                          next[idx] = { ...card, pointsText: e.target.value }
                          set('featureCards', next)
                        }}
                      />
                    </Label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
                onClick={() =>
                  set('featureCards', [
                    ...value.featureCards,
                    { accent: '', title: '', pointsText: '' },
                  ])
                }
              >
                <Plus className="h-4 w-4" /> {t('pageForm.addFeatureCard')}
              </button>
            </div>
          </>
        ) : null}
      </Card>

      <Card title={t('pageForm.benefits')}>
        <label className="flex items-center gap-3 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={value.benefitsEnabled}
            onChange={(e) => set('benefitsEnabled', e.target.checked)}
            className="accent-[var(--primary)]"
          />
          {t('pageForm.enableBenefits')}
        </label>
        {value.benefitsEnabled ? (
          <>
            <Label label={t('pageForm.heading')} dir={dir}>
              <input
                className={fieldClass()}
                value={value.benefitsHeading}
                onChange={(e) => set('benefitsHeading', e.target.value)}
              />
            </Label>
            <div className="space-y-3">
              {value.benefits.map((item, idx) => (
                <div key={idx} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_auto]">
                  <Label label={t('common.title')} dir={dir}>
                    <input
                      className={fieldClass()}
                      value={item.title}
                      onChange={(e) => {
                        const next = [...value.benefits]
                        next[idx] = { ...item, title: e.target.value }
                        set('benefits', next)
                      }}
                    />
                  </Label>
                  <Label label={t('common.description')} dir={dir}>
                    <input
                      className={fieldClass()}
                      value={item.desc}
                      onChange={(e) => {
                        const next = [...value.benefits]
                        next[idx] = { ...item, desc: e.target.value }
                        set('benefits', next)
                      }}
                    />
                  </Label>
                  <button
                    type="button"
                    className="self-end pb-2 text-red-600"
                    onClick={() => set('benefits', value.benefits.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
                onClick={() => set('benefits', [...value.benefits, { title: '', desc: '' }])}
              >
                <Plus className="h-4 w-4" /> {t('pageForm.addBenefit')}
              </button>
            </div>
          </>
        ) : null}
      </Card>

      <Card title={t('pageForm.useCases')}>
        <label className="flex items-center gap-3 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={value.useCasesEnabled}
            onChange={(e) => set('useCasesEnabled', e.target.checked)}
            className="accent-[var(--primary)]"
          />
          {t('pageForm.enableUseCases')}
        </label>
        {value.useCasesEnabled ? (
          <>
            <Label label={t('pageForm.heading')} dir={dir}>
              <input
                className={fieldClass()}
                value={value.useCasesHeading}
                onChange={(e) => set('useCasesHeading', e.target.value)}
              />
            </Label>
            <Label label={t('pageForm.items')} dir={dir}>
              <textarea
                className={`${fieldClass()} min-h-[120px] resize-y`}
                value={value.useCasesText}
                onChange={(e) => set('useCasesText', e.target.value)}
              />
            </Label>
          </>
        ) : null}
      </Card>
        </>
      ) : null}
    </div>
  )
}
