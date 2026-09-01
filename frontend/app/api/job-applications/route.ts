import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Proxies job application form submissions (multipart) to the Express backend. */
export async function POST(req: Request) {
  const formData = await req.formData()
  const res = await fetch(`${getApiUrl()}/api/job-applications`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
