import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { getMember } from '@/lib/queries'
import { prisma } from '@/lib/prisma'

// GET /api/gyms/[gymSlug]/members/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string; id: string }> }
) {
  const { gymSlug, id } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }

  const member = await getMember(id, ctxResult.ctx.gym.id)
  if (!member) {
    return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ member })
}

// PATCH /api/gyms/[gymSlug]/members/[id]
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

  // Verify ownership
  const existing = await prisma.member.findFirst({ where: { id, gymId: gym.id } })
  if (!existing) {
    return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 })
  }

  const { fullName, phone, gender, birthDate, nationalId, address, notes, isActive } = body

  const member = await prisma.member.update({
    where: { id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(gender !== undefined && { gender }),
      ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      ...(nationalId !== undefined && { nationalId }),
      ...(address !== undefined && { address }),
      ...(notes !== undefined && { notes }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json({ success: true, member })
}

// DELETE /api/gyms/[gymSlug]/members/[id]
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

  // Soft delete — just deactivate, never destroy data
  const existing = await prisma.member.findFirst({ where: { id, gymId: gym.id } })
  if (!existing) {
    return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 })
  }

  await prisma.member.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
