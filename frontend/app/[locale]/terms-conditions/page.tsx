'use client'

import { useTranslations } from 'next-intl'
import { LegalPage } from '@/components/legal-page'

export default function TermsPage() {
  const t = useTranslations('legal')

  return (
    <LegalPage
      title={t('termsTitle')}
      intro={t('termsBody')}
      sections={[
        {
          heading: t('termsTitle'),
          paragraphs: [t('termsBody')],
        },
      ]}
    />
  )
}
