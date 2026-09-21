import { buildGeoBankFull } from '@/lib/geo-question-bank'
import { plainTextResponse } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const body = [
    '# BAB International Corp — GEO Question Bank (1000)',
    '1,000 bilingual AI-search questions for BAB International Corp in Saudi Arabia.',
    '1000 سؤال باللغتين العربية والإنجليزية لشركة باب العالمية في السعودية.',
    '',
    buildGeoBankFull(),
  ].join('\n')
  return plainTextResponse(body)
}
