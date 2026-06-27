import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { prisma } from '@/lib/prisma'

// GET /api/gyms/[gymSlug]/classes/[id]
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

  const classRoom = await prisma.classRoom.findFirst({
    where: { id, gymId: gym.id },
    include: {
      trainer: { select: { id: true, fullName: true } },
      branch: { select: { id: true, name: true } },
      _count: { select: { bookings: true } },
    },
  })
  if (!classRoom) {
    return NextResponse.json({ error: 'الكلاس غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ class: classRoom })
}

// PATCH /api/gyms/[gymSlug]/classes/[id]
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

  const existing = await prisma.classRoom.findFirst({ where: { id, gymId: gym.id } })
  if (!existing) {
    return NextResponse.json({ error: 'الكلاس غير موجود' }, { status: 404 })
  }

  const {
    name,
    description,
    capacity,
    price,
    dayOfWeek,
    startTime,
    duration,
    branchId,
    trainerId,
    isActive,
  } = body

  const classRoom = await prisma.classRoom.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(capacity !== undefined && { capacity: parseInt(capacity) }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(dayOfWeek !== undefined && { dayOfWeek }),
      ...(startTime !== undefined && { startTime: startTime ? new Date(startTime) : null }),
      ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
      ...(branchId !== undefined && { branchId }),
      ...(trainerId !== undefined && { trainerId }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json({ success: true, class: classRoom })
}

// DELETE /api/gyms/[gymSlug]/classes/[id]
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

  const existing = await prisma.classRoom.findFirst({ where: { id, gymId: gym.id } })
  if (!existing) {
    return NextResponse.json({ error: 'الكلاس غير موجود' }, { status: 404 })
  }

  await prisma.classRoom.update({ where: { id }, data: { isActive: false } })

  return NextResponse.json({ success: true })
}
