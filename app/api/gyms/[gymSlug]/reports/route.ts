import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { getReports } from '@/lib/queries'

// GET /api/gyms/[gymSlug]/reports
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
  const months = parseInt(searchParams.get('months') || '6')

  const reports = await getReports(gym.id, months)

  return NextResponse.json(reports)
}
