import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { prisma } from '@/lib/prisma'

// GET /api/gyms/[gymSlug]/branches/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string; id: string }> }
) {
  const { gymSlug, id } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const branch = await prisma.branch.findFirst({
    where: { id, gymId: gym.id },
    include: {
      _count: {
        select: { members: true, profiles: true, classes: true },
      },
    },
  })
  if (!branch) {
    return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ branch })
}

// PATCH /api/gyms/[gymSlug]/branches/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string; id: string }> }
) {
  const { gymSlug, id } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const body = await request.json()

  const existing = await prisma.branch.findFirst({ where: { id, gymId: gym.id } })
  if (!existing) {
    return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
  }

  const { name, address, phone, isMain, isActive } = body

  // If setting as main, unset other main branches
  if (isMain && !existing.isMain) {
    await prisma.branch.updateMany({
      where: { gymId: gym.id, isMain: true },
      data: { isMain: false },
    })
  }

  const branch = await prisma.branch.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(isMain !== undefined && { isMain }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json({ success: true, branch })
}

// DELETE /api/gyms/[gymSlug]/branches/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string; id: string }> }
) {
  const { gymSlug, id } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const existing = await prisma.branch.findFirst({ where: { id, gymId: gym.id } })
  if (!existing) {
    return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
  }

  await prisma.branch.update({ where: { id }, data: { isActive: false } })

  return NextResponse.json({ success: true })
}
