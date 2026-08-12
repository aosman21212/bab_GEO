import { buildAiTxt, plainTextResponse } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const body = await buildAiTxt()
  return plainTextResponse(body)
}
