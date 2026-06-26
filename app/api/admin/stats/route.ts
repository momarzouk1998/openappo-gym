import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats — platform overview for super_admin
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }

  if (session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'ممنوع' }, { status: 403 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalGyms,
    activeGyms,
    trialGyms,
    suspendedGyms,
    totalMembers,
    monthRevenueAgg,
    gyms,
  ] = await Promise.all([
    prisma.gym.count(),
    prisma.gym.count({ where: { status: 'active' } }),
    prisma.gym.count({ where: { status: 'trial' } }),
    prisma.gym.count({ where: { status: 'suspended' } }),
    prisma.member.count(),
    prisma.payment.aggregate({
      where: { status: 'paid', paidAt: { gte: startOfMonth } },
      _sum: { finalAmount: true },
    }),
    prisma.gym.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerName: true,
        ownerEmail: true,
        status: true,
        basePlanPrice: true,
        billingCycle: true,
        addons: true,
        nextBillingDate: true,
        createdAt: true,
      },
    }),
  ])

  // Expected revenue = sum of basePlanPrice for active + trial gyms
  const expectedRevenueAgg = await prisma.gym.aggregate({
    where: { status: { in: ['active', 'trial'] } },
    _sum: { basePlanPrice: true },
  })

  return NextResponse.json({
    stats: {
      totalGyms,
      activeGyms,
      trialGyms,
      suspendedGyms,
      totalMembers,
      monthRevenue: monthRevenueAgg._sum.finalAmount || 0,
      expectedRevenue: expectedRevenueAgg._sum.basePlanPrice || 0,
    },
    gyms,
  })
}
