'use client'

import { useTranslations } from 'next-intl'
import { LegalPage } from '@/components/legal-page'

export default function PrivacyPolicyPage() {
  const t = useTranslations('legal')

  return (
    <LegalPage
      title={t('privacyTitle')}
      intro={t('privacyBody')}
      sections={[
        {
          heading: t('privacyTitle'),
          paragraphs: [t('privacyBody')],
        },
      ]}
    />
  )
}
