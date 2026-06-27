import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlatformConfig, DEFAULT_ADDON_PRICES } from '@/lib/platform-config'

// GET /api/admin/config — current global pricing
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }
  if (session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'ممنوع' }, { status: 403 })
  }

  const cfg = await getPlatformConfig()
  return NextResponse.json(cfg)
}

// PATCH /api/admin/config — update global pricing
// Body: { starterPrice?, proPrice?, addonPrices?: Record<string, number> }
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }
  if (session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'ممنوع' }, { status: 403 })
  }

  const body = await request.json()
  const { starterPrice, proPrice, addonPrices } = body

  // Validation
  const data: Record<string, unknown> = {}
  if (starterPrice !== undefined) {
    if (typeof starterPrice !== 'number' || starterPrice < 0) {
      return NextResponse.json({ error: 'سعر Starter غير صالح' }, { status: 400 })
    }
    data.starterPrice = Math.round(starterPrice)
  }
  if (proPrice !== undefined) {
    if (typeof proPrice !== 'number' || proPrice < 0) {
      return NextResponse.json({ error: 'سعر Pro غير صالح' }, { status: 400 })
    }
    data.proPrice = Math.round(proPrice)
  }
  if (addonPrices !== undefined) {
    if (typeof addonPrices !== 'object' || addonPrices === null) {
      return NextResponse.json({ error: 'أسعار الإضافات غير صالحة' }, { status: 400 })
    }
    // Merge with defaults so unspecified addons keep their price
    const merged = { ...DEFAULT_ADDON_PRICES, ...addonPrices }
    data.addonPrices = merged
  }

  // upsert in case the singleton row doesn't exist yet
  const updated = await prisma.platformConfig.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...(data.starterPrice !== undefined ? { starterPrice: data.starterPrice as number } : {}),
      ...(data.proPrice !== undefined ? { proPrice: data.proPrice as number } : {}),
      ...(data.addonPrices ? { addonPrices: data.addonPrices as object } : {}),
    },
  })

  return NextResponse.json({
    success: true,
    starterPrice: updated.starterPrice,
    proPrice: updated.proPrice,
    addonPrices: updated.addonPrices,
  })
}
