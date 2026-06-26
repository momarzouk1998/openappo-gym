import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { getPayments } from '@/lib/queries'

// GET /api/gyms/[gymSlug]/payments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  const { gymSlug } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const method = searchParams.get('method') || undefined
  const status = (searchParams.get('status') as 'paid' | 'pending' | 'all') || 'all'
  const page = parseInt(searchParams.get('page') || '1')

  const result = await getPayments(gym.id, { search, method, status, page })
  return NextResponse.json(result)
}
