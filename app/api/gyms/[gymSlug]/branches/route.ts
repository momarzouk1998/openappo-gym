import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { getBranches } from '@/lib/queries'
import { prisma } from '@/lib/prisma'

// GET /api/gyms/[gymSlug]/branches
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

  const result = await getBranches(gym.id)
  return NextResponse.json(result)
}

// POST /api/gyms/[gymSlug]/branches
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
  const { name, address, phone, isMain } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'اسم الفرع مطلوب' }, { status: 400 })
  }

  // If setting as main, unset other main branches
  if (isMain) {
    await prisma.branch.updateMany({
      where: { gymId: gym.id, isMain: true },
      data: { isMain: false },
    })
  }

  const branch = await prisma.branch.create({
    data: {
      gymId: gym.id,
      name: name.trim(),
      address: address || null,
      phone: phone || null,
      isMain: isMain || false,
    },
  })

  return NextResponse.json({ success: true, branch }, { status: 201 })
}
