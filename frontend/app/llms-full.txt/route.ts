import { buildLlmsFullTxt, plainTextResponse } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const body = await buildLlmsFullTxt()
  return plainTextResponse(body)
}
