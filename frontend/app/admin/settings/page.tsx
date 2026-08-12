'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'
import { useAdminLocale } from '@/components/admin-locale-provider'
import { Mail, Plus, Trash2 } from 'lucide-react'

type FaqItem = { question: string; answer: string }

type SiteSettings = {
  maintenanceMode: boolean
  defaultLanguage: 'en' | 'ar'
  email: string
  phone: string
  hoursEn: string
  hoursAr: string
  addressEn: string
  addressAr: string
  seoTitleEn: string
  seoTitleAr: string
  seoDescriptionEn: string
  seoDescriptionAr: string
  homepageFaqsEn: FaqItem[]
  homepageFaqsAr: FaqItem[]
}

const defaults: SiteSettings = {
  maintenanceMode: false,
  defaultLanguage: 'en',
  email: 'info@bab.com.sa',
  phone: '+966 11 512 1440',
  hoursEn: 'Sun - Thu 8:00 AM - 5:00 PM',
  hoursAr: 'الأحد - الخميس ٨:٠٠ ص - ٥:٠٠ م',
  addressEn: 'Al-Yasmin, King Abdulaziz Rd, Riyadh, KSA',
  addressAr: 'الياسمين، طريق الملك عبدالعزيز، الرياض، المملكة العربية السعودية',
  seoTitleEn:
    'BAB International Corp | Omnichannel, Contact Center & AI Voice Bots in Saudi Arabia',
  seoTitleAr:
    'باب الدولية | قنوات متعددة ومراكز اتصال وروبوتات صوتية بالذكاء الاصطناعي في السعودية',
  seoDescriptionEn:
    'Saudi enterprise partner for seamless connectivity and intelligent CX: omnichannel engagement, AI and voice bots, and contact-center platforms across Saudi Arabia and the MENA region.',
  seoDescriptionAr:
    'شريك مؤسسي سعودي للاتصال السلس وتجربة العملاء الذكية: تفاعل متعدد القنوات، وروبوتات صوتية وذكاء اصطناعي، ومنصات مراكز اتصال في المملكة ومنطقة الشرق الأوسط وشمال أفريقيا.',
  homepageFaqsEn: [
    {
      question: 'What does BAB International Corp offer?',
      answer:
        'BAB delivers seamless connectivity and intelligent solutions including omnichannel engagement, AI, voice bots, and industry contact-center platforms across Saudi Arabia and the region.',
    },
    {
      question: 'What contact-center and omnichannel solutions does BAB provide?',
      answer:
        'BAB helps enterprises unify customer journeys across voice, digital, and social channels, with contact-center platforms, live engagement, and omnichannel orchestration designed for Saudi and regional operations.',
    },
    {
      question: 'Does BAB offer voice bots and AI for customer service?',
      answer:
        'Yes. BAB provides AI solutions and voice bots that support assisted and automated customer service, helping teams contain routine inquiries and improve response quality.',
    },
    {
      question: 'Why choose a Saudi connectivity and CX partner?',
      answer:
        'BAB is based in Riyadh and focuses on local delivery for enterprises that need contact-center, omnichannel, and intelligent service platforms aligned with Saudi and MENA market needs.',
    },
    {
      question: 'Where is BAB located?',
      answer: 'BAB is based in Al-Yasmin, King Abdulaziz Rd, Riyadh, Kingdom of Saudi Arabia.',
    },
    {
      question: 'How can I contact BAB?',
      answer:
        'Email info@bab.com.sa or call +966 11 512 1440. Business hours are Sunday–Thursday, 8:00 AM–5:00 PM.',
    },
  ],
  homepageFaqsAr: [
    {
      question: 'ماذا تقدم شركة باب الدولية؟',
      answer:
        'تقدم باب حلول اتصال سلسة وذكية تشمل التفاعل متعدد القنوات والذكاء الاصطناعي والروبوتات الصوتية ومنصات مراكز الاتصال في المملكة والمنطقة.',
    },
    {
      question: 'ما حلول مراكز الاتصال والقنوات المتعددة التي تقدمها باب؟',
      answer:
        'تساعد باب المؤسسات على توحيد رحلات العملاء عبر الصوت والرقمي ووسائل التواصل، عبر منصات مراكز اتصال وتفاعل مباشر وتنسيق متعدد القنوات مصممة لعمليات السعودية والمنطقة.',
    },
    {
      question: 'هل تقدم باب روبوتات صوتية وذكاء اصطناعي لخدمة العملاء؟',
      answer:
        'نعم. توفر باب حلول ذكاء اصطناعي وروبوتات صوتية تدعم الخدمة الآلية والمدعومة، مما يساعد الفرق على احتواء الاستفسارات الروتينية وتحسين جودة الاستجابة.',
    },
    {
      question: 'لماذا تختار شريكاً سعودياً للاتصال وتجربة العملاء؟',
      answer:
        'باب مقرها الرياض وتركّز على التنفيذ المحلي للمؤسسات التي تحتاج منصات مراكز اتصال وقنوات متعددة وخدمة ذكية متوافقة مع احتياجات السوق السعودي ومنطقة الشرق الأوسط وشمال أفريقيا.',
    },
    {
      question: 'أين تقع باب؟',
      answer: 'تقع باب في الياسمين، طريق الملك عبدالعزيز، الرياض، المملكة العربية السعودية.',
    },
    {
      question: 'كيف أتواصل مع باب؟',
      answer:
        'راسل info@bab.com.sa أو اتصل على +966 11 512 1440. ساعات العمل الأحد–الخميس ٨:٠٠ ص–٥:٠٠ م.',
    },
  ],
}

function fieldClass() {
  return 'w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:bg-white'
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { t } = useAdminLocale()
  const [settings, setSettings] = useState<SiteSettings>(defaults)
  const [faqLocale, setFaqLocale] = useState<'en' | 'ar'>('en')
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/proxy/content/admin/en')
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) return
      const docs = (await res.json()) as { key: string; data: Partial<SiteSettings> }[]
      const doc = docs.find((d) => d.key === 'siteSettings')
      if (doc?.data) {
        setSettings({
          ...defaults,
          ...doc.data,
          homepageFaqsEn: doc.data.homepageFaqsEn ?? defaults.homepageFaqsEn,
          homepageFaqsAr: doc.data.homepageFaqsAr ?? defaults.homepageFaqsAr,
        })
      }
    }
    load()
  }, [router])

  const save = async () => {
    setPending(true)
    setStatus(null)
    const [enRes, arRes] = await Promise.all([
      fetch('/api/admin/proxy/content/en/siteSettings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: settings }),
      }),
      fetch('/api/admin/proxy/content/ar/siteSettings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: settings }),
      }),
    ])
    setPending(false)
    if (!enRes.ok || !arRes.ok) {
      setStatus(t('common.saveFailed'))
      return
    }
    setStatus(t('common.saved'))
  }

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setStatus(null)
  }

  const faqKey = faqLocale === 'en' ? 'homepageFaqsEn' : 'homepageFaqsAr'
  const faqs = settings[faqKey]

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const next = faqs.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    set(faqKey, next)
  }

  const addFaq = () => {
    set(faqKey, [...faqs, { question: '', answer: '' }])
  }

  const removeFaq = (index: number) => {
    set(
      faqKey,
      faqs.filter((_, i) => i !== index),
    )
  }

  return (
    <AdminShell
      title={t('settings.title')}
      description={t('settings.description')}
      actions={
        <div className="flex items-center gap-3">
          {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? t('common.saving') : t('common.saveChanges')}
          </button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-6 xl:grid-cols-2">
          {/* General */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-navy">{t('settings.general')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('settings.generalBody')}</p>

            <div className="mt-6 flex items-start justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-sm font-semibold text-navy">{t('settings.maintenance')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('settings.maintenanceBody')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.maintenanceMode}
                onClick={() => set('maintenanceMode', !settings.maintenanceMode)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-primary' : 'bg-brand-indigo/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    settings.maintenanceMode ? 'start-[1.35rem]' : 'start-0.5'
                  }`}
                />
              </button>
            </div>

            <label className="mt-6 flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('settings.defaultLanguage')}
              <select
                className={fieldClass()}
                value={settings.defaultLanguage}
                onChange={(e) => set('defaultLanguage', e.target.value as 'en' | 'ar')}
              >
                <option value="en">{t('english')}</option>
                <option value="ar">{t('settings.arabicOption')}</option>
              </select>
            </label>
          </section>

          {/* SEO */}
          <section id="seo" className="scroll-mt-24 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-navy">{t('settings.seo')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('settings.seoBody')}</p>

            <div className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                {t('settings.seoTitleEn')}
                <input
                  className={fieldClass()}
                  value={settings.seoTitleEn}
                  onChange={(e) => set('seoTitleEn', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                {t('settings.seoDescEn')}
                <textarea
                  className={`${fieldClass()} min-h-[88px] resize-none`}
                  value={settings.seoDescriptionEn}
                  onChange={(e) => set('seoDescriptionEn', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                {t('settings.seoTitleAr')}
                <input
                  className={fieldClass()}
                  dir="rtl"
                  value={settings.seoTitleAr}
                  onChange={(e) => set('seoTitleAr', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                {t('settings.seoDescAr')}
                <textarea
                  className={`${fieldClass()} min-h-[88px] resize-none`}
                  dir="rtl"
                  value={settings.seoDescriptionAr}
                  onChange={(e) => set('seoDescriptionAr', e.target.value)}
                />
              </label>
            </div>
          </section>
        </div>

        {/* Contact */}
        <section
          id="contact"
          className="scroll-mt-24 rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-extrabold text-navy">{t('settings.contact')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('settings.contactBody')}</p>

          <Link
            href="/admin/inquiries"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy/10"
          >
            <Mail className="h-4 w-4 text-primary" />
            {t('settings.openInbox')}
          </Link>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('common.email')}
              <input
                className={fieldClass()}
                type="email"
                value={settings.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('common.phone')}
              <input
                className={fieldClass()}
                type="tel"
                value={settings.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('settings.hoursAr')}
              <input
                className={fieldClass()}
                dir="rtl"
                value={settings.hoursAr}
                onChange={(e) => set('hoursAr', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('settings.hoursEn')}
              <input
                className={fieldClass()}
                value={settings.hoursEn}
                onChange={(e) => set('hoursEn', e.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('settings.addressAr')}
              <textarea
                className={`${fieldClass()} min-h-[88px] resize-none`}
                dir="rtl"
                value={settings.addressAr}
                onChange={(e) => set('addressAr', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              {t('settings.addressEn')}
              <textarea
                className={`${fieldClass()} min-h-[88px] resize-none`}
                value={settings.addressEn}
                onChange={(e) => set('addressEn', e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* Homepage FAQ */}
        <section id="faq" className="scroll-mt-24 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-navy">{t('settings.faq')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('settings.faqBody')}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-primary"
                value={faqLocale}
                onChange={(e) => setFaqLocale(e.target.value as 'en' | 'ar')}
              >
                <option value="en">{t('settings.faqsEn')}</option>
                <option value="ar">{t('settings.faqsAr')}</option>
              </select>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold text-navy hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> {t('common.add')}
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {faqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('settings.faqEmpty')}</p>
            ) : (
              faqs.map((item, index) => (
                <div
                  key={`${faqLocale}-${index}`}
                  className="rounded-xl border border-border bg-muted/50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold tracking-wide text-primary">Q{index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
                    </button>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                    {t('settings.question')}
                    <input
                      className={fieldClass()}
                      dir={faqLocale === 'ar' ? 'rtl' : 'ltr'}
                      value={item.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                    />
                  </label>
                  <label className="mt-3 flex flex-col gap-2 text-sm font-semibold text-navy">
                    {t('settings.answer')}
                    <textarea
                      className={`${fieldClass()} min-h-[88px] resize-none`}
                      dir={faqLocale === 'ar' ? 'rtl' : 'ltr'}
                      value={item.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                    />
                  </label>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
