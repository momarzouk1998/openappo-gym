import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { getTrainers } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

// GET /api/gyms/[gymSlug]/trainers?search=&page=
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
  const page = parseInt(searchParams.get('page') || '1')

  const result = await getTrainers(gym.id, { search, page })
  return NextResponse.json(result)
}

// POST /api/gyms/[gymSlug]/trainers
export async function POST(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  const { gymSlug } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const body = await request.json()
  const { fullName, phone, branchId } = body

  if (!fullName?.trim()) {
    return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
  }

  const profile = await prisma.profile.create({
    data: {
      gymId: gym.id,
      fullName: fullName.trim(),
      phone: phone || null,
      branchId: branchId || null,
      role: 'trainer' as UserRole,
    },
  })

  return NextResponse.json({ success: true, trainer: profile }, { status: 201 })
}
