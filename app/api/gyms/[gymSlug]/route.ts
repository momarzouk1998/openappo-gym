import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { prisma } from '@/lib/prisma'

// GET /api/gyms/[gymSlug] — get gym details + plans
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

  const [gymData, plans] = await Promise.all([
    prisma.gym.findUnique({
      where: { id: gym.id },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        city: true,
        address: true,
        status: true,
        basePlanPrice: true,
        addons: true,
        billingCycle: true,
        createdAt: true,
      },
    }),
    prisma.gymPlan.findMany({
      where: { gymId: gym.id },
      orderBy: { price: 'asc' },
    }),
  ])

  return NextResponse.json({ gym: gymData, plans })
}

// PATCH /api/gyms/[gymSlug] — update gym info
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  const { gymSlug } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym, role } = ctxResult.ctx

  // Only owner/manager can edit gym info
  if (role === 'cashier' || role === 'trainer') {
    return NextResponse.json({ error: 'لا تملك صلاحية التعديل' }, { status: 403 })
  }

  const body = await request.json()
  const { name, phone, city, address, basePlanPrice, addons } = body

  // Validate basePlanPrice if provided (must be a valid plan price)
  if (basePlanPrice !== undefined) {
    const validPrices = [299, 599] // starter, pro
    if (!validPrices.includes(basePlanPrice)) {
      return NextResponse.json(
        { error: 'سعر الباقة غير صالح' },
        { status: 400 }
      )
    }
  }

  const updated = await prisma.gym.update({
    where: { id: gym.id },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(city !== undefined && { city: city || null }),
      ...(address !== undefined && { address: address || null }),
      ...(basePlanPrice !== undefined && { basePlanPrice }),
      ...(addons !== undefined && { addons }),
    },
    select: { id: true, name: true, slug: true, basePlanPrice: true, addons: true },
  })

  return NextResponse.json({ success: true, gym: updated })
}
