'use client'

import { type ReactNode } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { AdminGalleryImagesField } from '@/components/admin-gallery-images-field'
import { AdminImagePicker } from '@/components/admin-image-picker'
import { AdminMediaPreview } from '@/components/admin-media-preview'
import {
  INDUSTRY_IDS,
  PILLAR_IDS,
  STAT_IDS,
  WORK_IDS,
  type HomepageIndustryId,
  type HomepageLocaleData,
} from '@/lib/homepage-content'

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

function ImageField({
  value,
  onChange,
  label,
  hint,
  uploadLabel,
  noImageLabel,
}: {
  value: string
  onChange: (url: string) => void
  label: string
  hint: string
  uploadLabel: string
  noImageLabel: string
}) {
  return (
    <Label label={label}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <AdminMediaPreview src={value} label={noImageLabel} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <AdminImagePicker
            onUploaded={(url) => onChange(url)}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
          >
            <Upload className="h-4 w-4 text-primary" />
            {uploadLabel}
          </AdminImagePicker>
          <input
            className={`${fieldClass()} font-mono`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/..."
          />
          <p className="text-xs font-normal text-muted-foreground">{hint}</p>
        </div>
      </div>
    </Label>
  )
}

export function AdminHomepageForm({
  locale,
  value,
  onChange,
}: {
  locale: 'en' | 'ar'
  value: HomepageLocaleData
  onChange: (value: HomepageLocaleData) => void
}) {
  const { t } = useAdminLocale()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const set = (next: HomepageLocaleData) => onChange(next)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t('homeForm.lockedHint')}</p>

      <Card title={t('homeForm.seo')} subtitle={t('homeForm.seoSubtitle')}>
        <Label label={t('pageForm.metaTitle')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.metaTitle}
            onChange={(e) => set({ ...value, metaTitle: e.target.value })}
          />
        </Label>
        <Label label={t('pageForm.metaDescription')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[90px] resize-y`}
            value={value.metaDescription}
            onChange={(e) => set({ ...value, metaDescription: e.target.value })}
          />
        </Label>
      </Card>

      <Card title={t('homeForm.hero')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.hero.title}
            onChange={(e) => set({ ...value, hero: { ...value.hero, title: e.target.value } })}
          />
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[90px] resize-y`}
            value={value.hero.body}
            onChange={(e) => set({ ...value, hero: { ...value.hero, body: e.target.value } })}
          />
        </Label>
        <Label label={t('pageForm.ctaLabel')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.hero.cta}
            onChange={(e) => set({ ...value, hero: { ...value.hero, cta: e.target.value } })}
          />
        </Label>
        <Label label={t('homeForm.heroSlides')}>
          <AdminGalleryImagesField
            value={value.hero.slides.join('\n')}
            onChange={(text) =>
              set({
                ...value,
                hero: {
                  ...value.hero,
                  slides: text
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </Label>
      </Card>

      <Card title={t('homeForm.works')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.works.title}
            onChange={(e) => set({ ...value, works: { ...value.works, title: e.target.value } })}
          />
        </Label>
      </Card>

      <Card title={t('homeForm.experience')}>
        <Label label={t('pageForm.eyebrow')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.experience.eyebrow}
            onChange={(e) =>
              set({ ...value, experience: { ...value.experience, eyebrow: e.target.value } })
            }
          />
        </Label>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.experience.title}
            onChange={(e) =>
              set({ ...value, experience: { ...value.experience, title: e.target.value } })
            }
          />
        </Label>

        {WORK_IDS.map((id, index) => (
          <div key={id} className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-bold text-navy">
              {t('homeForm.workItem', { n: index + 1 })}
            </p>
            <div className="space-y-3">
              <Label label={t('pageForm.heading')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.works.items[id].title}
                  onChange={(e) =>
                    set({
                      ...value,
                      works: {
                        ...value.works,
                        items: {
                          ...value.works.items,
                          [id]: { ...value.works.items[id], title: e.target.value },
                        },
                      },
                    })
                  }
                />
              </Label>
              <Label label={t('common.description')} dir={dir}>
                <textarea
                  className={`${fieldClass()} min-h-[70px] resize-y`}
                  value={value.works.items[id].body}
                  onChange={(e) =>
                    set({
                      ...value,
                      works: {
                        ...value.works,
                        items: {
                          ...value.works.items,
                          [id]: { ...value.works.items[id], body: e.target.value },
                        },
                      },
                    })
                  }
                />
              </Label>
            </div>
          </div>
        ))}

        {PILLAR_IDS.map((id) => (
          <div key={id} className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-bold text-navy">
              {t('homeForm.pillar', { name: id })}
            </p>
            <div className="space-y-3">
              <Label label={t('homeForm.label')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.experience[id].label}
                  onChange={(e) =>
                    set({
                      ...value,
                      experience: {
                        ...value.experience,
                        [id]: { ...value.experience[id], label: e.target.value },
                      },
                    })
                  }
                />
              </Label>
              <Label label={t('pageForm.heading')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.experience[id].title}
                  onChange={(e) =>
                    set({
                      ...value,
                      experience: {
                        ...value.experience,
                        [id]: { ...value.experience[id], title: e.target.value },
                      },
                    })
                  }
                />
              </Label>
              <Label label={t('common.description')} dir={dir}>
                <textarea
                  className={`${fieldClass()} min-h-[70px] resize-y`}
                  value={value.experience[id].body}
                  onChange={(e) =>
                    set({
                      ...value,
                      experience: {
                        ...value.experience,
                        [id]: { ...value.experience[id], body: e.target.value },
                      },
                    })
                  }
                />
              </Label>
            </div>
          </div>
        ))}
      </Card>

      <Card title={t('homeForm.industries')}>
        <Label label={t('pageForm.eyebrow')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.industries.eyebrow}
            onChange={(e) =>
              set({ ...value, industries: { ...value.industries, eyebrow: e.target.value } })
            }
          />
        </Label>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.industries.title}
            onChange={(e) =>
              set({ ...value, industries: { ...value.industries, title: e.target.value } })
            }
          />
        </Label>
        <Label label={t('pageForm.ctaLabel')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.industries.bookDemo}
            onChange={(e) =>
              set({ ...value, industries: { ...value.industries, bookDemo: e.target.value } })
            }
          />
        </Label>

        {INDUSTRY_IDS.map((id) => (
          <div key={id} className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-bold text-navy">
              {t('homeForm.industryTab', { name: id })}
            </p>
            <div className="space-y-3">
              <Label label={t('homeForm.tabLabel')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.industries[id].tab}
                  onChange={(e) =>
                    setIndustry(value, set, id, { tab: e.target.value })
                  }
                />
              </Label>
              <Label label={t('pageForm.heading')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.industries[id].title}
                  onChange={(e) =>
                    setIndustry(value, set, id, { title: e.target.value })
                  }
                />
              </Label>
              <Label label={t('common.description')} dir={dir}>
                <textarea
                  className={`${fieldClass()} min-h-[80px] resize-y`}
                  value={value.industries[id].body}
                  onChange={(e) =>
                    setIndustry(value, set, id, { body: e.target.value })
                  }
                />
              </Label>
              <ImageField
                value={value.industries[id].image}
                onChange={(image) => setIndustry(value, set, id, { image })}
                label={t('homeForm.industryImage')}
                hint={t('pageForm.imageHint')}
                uploadLabel={t('pageForm.uploadImage')}
                noImageLabel={t('pageForm.noImage')}
              />
            </div>
          </div>
        ))}

        <div>
          <p className="mb-3 text-sm font-bold text-navy">{t('homeForm.stats')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {STAT_IDS.map((id) => (
              <Label key={id} label={id} dir={dir}>
                <input
                  className={fieldClass()}
                  value={value.stats[id]}
                  onChange={(e) =>
                    set({ ...value, stats: { ...value.stats, [id]: e.target.value } })
                  }
                />
              </Label>
            ))}
          </div>
        </div>
      </Card>

      <Card title={t('homeForm.transformation')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.transformation.title}
            onChange={(e) =>
              set({
                ...value,
                transformation: { ...value.transformation, title: e.target.value },
              })
            }
          />
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[80px] resize-y`}
            value={value.transformation.body}
            onChange={(e) =>
              set({
                ...value,
                transformation: { ...value.transformation, body: e.target.value },
              })
            }
          />
        </Label>
        <Label label={t('pageForm.ctaLabel')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.transformation.cta}
            onChange={(e) =>
              set({
                ...value,
                transformation: { ...value.transformation, cta: e.target.value },
              })
            }
          />
        </Label>
        <ImageField
          value={value.transformation.image}
          onChange={(image) =>
            set({ ...value, transformation: { ...value.transformation, image } })
          }
          label={t('homeForm.backgroundImage')}
          hint={t('pageForm.imageHint')}
          uploadLabel={t('pageForm.uploadImage')}
          noImageLabel={t('pageForm.noImage')}
        />
      </Card>

      <Card title={t('homeForm.channels')}>
        <Label label={t('homeForm.headline')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[70px] resize-y font-mono text-sm`}
            value={value.channels.headline}
            onChange={(e) =>
              set({ ...value, channels: { ...value.channels, headline: e.target.value } })
            }
          />
          <span className="text-xs font-normal text-muted-foreground">
            {t('homeForm.headlineHint')}
          </span>
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[80px] resize-y`}
            value={value.channels.body}
            onChange={(e) =>
              set({ ...value, channels: { ...value.channels, body: e.target.value } })
            }
          />
        </Label>
      </Card>

      <Card title={t('homeForm.partners')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.partners.title}
            onChange={(e) =>
              set({ ...value, partners: { ...value.partners, title: e.target.value } })
            }
          />
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[80px] resize-y`}
            value={value.partners.body}
            onChange={(e) =>
              set({ ...value, partners: { ...value.partners, body: e.target.value } })
            }
          />
        </Label>
        <Label label={t('pageForm.ctaLabel')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.partners.cta}
            onChange={(e) =>
              set({ ...value, partners: { ...value.partners, cta: e.target.value } })
            }
          />
        </Label>
      </Card>

      <Card title={t('homeForm.testimonials')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.testimonials.title}
            onChange={(e) =>
              set({ ...value, testimonials: { title: e.target.value } })
            }
          />
          <span className="text-xs font-normal text-muted-foreground">
            {t('homeForm.headlineHint')}
          </span>
        </Label>
      </Card>

      <Card title={t('homeForm.faq')}>
        <Label label={t('pageForm.eyebrow')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.faq.eyebrow}
            onChange={(e) => set({ ...value, faq: { ...value.faq, eyebrow: e.target.value } })}
          />
        </Label>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.faq.title}
            onChange={(e) => set({ ...value, faq: { ...value.faq, title: e.target.value } })}
          />
        </Label>
        {value.faq.items.map((item, index) => (
          <div key={index} className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-navy">
                {t('homeForm.faqItem', { n: index + 1 })}
              </p>
              <button
                type="button"
                onClick={() =>
                  set({
                    ...value,
                    faq: {
                      ...value.faq,
                      items: value.faq.items.filter((_, i) => i !== index),
                    },
                  })
                }
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
              </button>
            </div>
            <div className="space-y-3">
              <Label label={t('settings.question')} dir={dir}>
                <input
                  className={fieldClass()}
                  value={item.question}
                  onChange={(e) => {
                    const items = value.faq.items.map((row, i) =>
                      i === index ? { ...row, question: e.target.value } : row,
                    )
                    set({ ...value, faq: { ...value.faq, items } })
                  }}
                />
              </Label>
              <Label label={t('settings.answer')} dir={dir}>
                <textarea
                  className={`${fieldClass()} min-h-[70px] resize-y`}
                  value={item.answer}
                  onChange={(e) => {
                    const items = value.faq.items.map((row, i) =>
                      i === index ? { ...row, answer: e.target.value } : row,
                    )
                    set({ ...value, faq: { ...value.faq, items } })
                  }}
                />
              </Label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            set({
              ...value,
              faq: { ...value.faq, items: [...value.faq.items, { question: '', answer: '' }] },
            })
          }
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:border-primary"
        >
          <Plus className="h-4 w-4" /> {t('homeForm.addFaq')}
        </button>
      </Card>

      <Card title={t('homeForm.impact')}>
        <Label label={t('pageForm.eyebrow')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.impact.eyebrow}
            onChange={(e) =>
              set({ ...value, impact: { ...value.impact, eyebrow: e.target.value } })
            }
          />
        </Label>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.impact.title}
            onChange={(e) =>
              set({ ...value, impact: { ...value.impact, title: e.target.value } })
            }
          />
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[80px] resize-y`}
            value={value.impact.body}
            onChange={(e) =>
              set({ ...value, impact: { ...value.impact, body: e.target.value } })
            }
          />
        </Label>
        <Label label={t('pageForm.ctaLabel')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.impact.cta}
            onChange={(e) => set({ ...value, impact: { ...value.impact, cta: e.target.value } })}
          />
        </Label>
        <ImageField
          value={value.impact.image}
          onChange={(image) => set({ ...value, impact: { ...value.impact, image } })}
          label={t('homeForm.backgroundImage')}
          hint={t('pageForm.imageHint')}
          uploadLabel={t('pageForm.uploadImage')}
          noImageLabel={t('pageForm.noImage')}
        />
      </Card>

      <Card title={t('homeForm.ctaSection')}>
        <Label label={t('pageForm.heading')} dir={dir}>
          <input
            className={fieldClass()}
            value={value.cta.title}
            onChange={(e) => set({ ...value, cta: { ...value.cta, title: e.target.value } })}
          />
        </Label>
        <Label label={t('common.description')} dir={dir}>
          <textarea
            className={`${fieldClass()} min-h-[80px] resize-y`}
            value={value.cta.body}
            onChange={(e) => set({ ...value, cta: { ...value.cta, body: e.target.value } })}
          />
        </Label>
      </Card>
    </div>
  )
}

function setIndustry(
  value: HomepageLocaleData,
  set: (next: HomepageLocaleData) => void,
  id: HomepageIndustryId,
  patch: Partial<HomepageLocaleData['industries'][HomepageIndustryId]>,
) {
  set({
    ...value,
    industries: {
      ...value.industries,
      [id]: { ...value.industries[id], ...patch },
    },
  })
}