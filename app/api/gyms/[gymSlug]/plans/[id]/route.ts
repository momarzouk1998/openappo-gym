import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { prisma } from '@/lib/prisma'

// DELETE /api/gyms/[gymSlug]/plans/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string; id: string }> }
) {
  const { gymSlug, id } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym, role } = ctxResult.ctx

  if (role === 'cashier' || role === 'trainer') {
    return NextResponse.json({ error: 'لا تملك صلاحية الحذف' }, { status: 403 })
  }

  // Verify plan belongs to gym before deleting
  const plan = await prisma.gymPlan.findFirst({
    where: { id, gymId: gym.id },
  })

  if (!plan) {
    return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 })
  }

  await prisma.gymPlan.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
