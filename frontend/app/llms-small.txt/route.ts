import { buildLlmsSmallTxt, plainTextResponse } from '@/lib/geo-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const body = await buildLlmsSmallTxt()
  return plainTextResponse(body)
}
