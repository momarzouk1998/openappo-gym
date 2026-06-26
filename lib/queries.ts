import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

// ========================================
// DASHBOARD STATS
// ========================================

export async function getDashboardStats(gymId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [totalMembers, activeSubs, expiringSoon, monthlyRevenueAgg] =
    await Promise.all([
      prisma.member.count({
        where: { gymId, isActive: true },
      }),
      prisma.subscription.count({
        where: {
          gymId,
          status: 'active',
          endDate: { gte: now },
        },
      }),
      prisma.subscription.count({
        where: {
          gymId,
          status: 'active',
          endDate: { gte: now, lte: inSevenDays },
        },
      }),
      prisma.payment.aggregate({
        where: {
          gymId,
          status: 'paid',
          paidAt: { gte: startOfMonth },
        },
        _sum: { finalAmount: true },
      }),
    ])

  return {
    totalMembers,
    activeSubs,
    expiringSoon,
    monthlyRevenue: monthlyRevenueAgg._sum.finalAmount || 0,
  }
}

export async function getRevenueChart(gymId: string, months = 6) {
  const now = new Date()
  const result: { month: string; revenue: number; label: string }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const agg = await prisma.payment.aggregate({
      where: {
        gymId,
        status: 'paid',
        paidAt: { gte: start, lt: end },
      },
      _sum: { finalAmount: true },
    })

    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ]

    result.push({
      month: `${start.getFullYear()}-${start.getMonth() + 1}`,
      revenue: agg._sum.finalAmount || 0,
      label: monthNames[start.getMonth()],
    })
  }

  return result
}

// ========================================
// MEMBERS
// ========================================

export interface MemberFilters {
  search?: string
  status?: 'active' | 'inactive'
  page?: number
  pageSize?: number
}

export async function getMembers(gymId: string, filters: MemberFilters = {}) {
  const { search, status, page = 1, pageSize = 20 } = filters

  const where: Prisma.MemberWhereInput = {
    gymId,
    ...(status && { isActive: status === 'active' }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { memberNumber: { contains: search } },
      ],
    }),
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1,
          select: { id: true, endDate: true, status: true },
        },
      },
    }),
    prisma.member.count({ where }),
  ])

  return { members, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getMember(id: string, gymId: string) {
  return prisma.member.findFirst({
    where: { id, gymId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        include: { plan: true },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
        take: 20,
      },
      trainer: { select: { id: true, fullName: true } },
    },
  })
}

export async function generateMemberNumber(gymId: string): Promise<string> {
  const count = await prisma.member.count({ where: { gymId } })
  const next = count + 1
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { slug: true },
  })
  const prefix = gym?.slug?.slice(0, 3).toUpperCase() || 'GYM'
  return `${prefix}-${String(next).padStart(4, '0')}`
}

// ========================================
// SUBSCRIPTIONS
// ========================================

export interface SubscriptionFilters {
  search?: string
  status?: 'active' | 'expired' | 'frozen' | 'all'
  page?: number
  pageSize?: number
}

export async function getSubscriptions(gymId: string, filters: SubscriptionFilters = {}) {
  const { search, status, page = 1, pageSize = 20 } = filters
  const now = new Date()

  const where: Prisma.SubscriptionWhereInput = {
    gymId,
    ...(status && status !== 'all' && { status }),
    ...(search && {
      member: {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      },
    }),
  }

  const [subscriptions, total, active, expired, frozen] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        member: { select: { id: true, fullName: true, phone: true, memberNumber: true } },
        plan: { select: { id: true, name: true, duration: true } },
      },
    }),
    prisma.subscription.count({ where }),
    prisma.subscription.count({
      where: { gymId, status: 'active', endDate: { gte: now } },
    }),
    prisma.subscription.count({
      where: { gymId, endDate: { lt: now } },
    }),
    prisma.subscription.count({
      where: { gymId, status: 'frozen' },
    }),
  ])

  return {
    subscriptions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    stats: { active, expired, frozen },
  }
}

export async function getExpiringSubscriptions(gymId: string, days = 7) {
  const now = new Date()
  const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  return prisma.subscription.findMany({
    where: {
      gymId,
      status: 'active',
      endDate: { gte: now, lte: limit },
    },
    include: {
      member: {
        select: { id: true, fullName: true, phone: true },
      },
      plan: { select: { name: true } },
    },
    orderBy: { endDate: 'asc' },
    take: 10,
  })
}

// ========================================
// PAYMENTS
// ========================================

export interface PaymentFilters {
  search?: string
  method?: string
  status?: 'paid' | 'pending' | 'all'
  page?: number
  pageSize?: number
}

export async function getPayments(gymId: string, filters: PaymentFilters = {}) {
  const { search, method, status, page = 1, pageSize = 20 } = filters

  const where: Prisma.PaymentWhereInput = {
    gymId,
    ...(method && { method: method as any }),
    ...(status && status !== 'all' && { status }),
    ...(search && {
      member: {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      },
    }),
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [payments, total, todayAgg, monthAgg, pendingAgg] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        member: { select: { id: true, fullName: true, phone: true } },
        subscription: { select: { id: true, plan: { select: { name: true } } } },
      },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { gymId, status: 'paid', paidAt: { gte: startOfDay } },
      _sum: { finalAmount: true },
    }),
    prisma.payment.aggregate({
      where: { gymId, status: 'paid', paidAt: { gte: startOfMonth } },
      _sum: { finalAmount: true },
    }),
    prisma.payment.aggregate({
      where: { gymId, status: 'pending' },
      _sum: { finalAmount: true },
    }),
  ])

  return {
    payments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    stats: {
      today: todayAgg._sum.finalAmount || 0,
      month: monthAgg._sum.finalAmount || 0,
      pending: pendingAgg._sum.finalAmount || 0,
    },
  }
}

export async function getRecentPayments(gymId: string, limit = 5) {
  return prisma.payment.findMany({
    where: { gymId },
    orderBy: { paidAt: 'desc' },
    take: limit,
    include: {
      member: { select: { id: true, fullName: true } },
    },
  })
}

export async function getRecentMembers(gymId: string, limit = 5) {
  return prisma.member.findMany({
    where: { gymId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      fullName: true,
      phone: true,
      memberNumber: true,
      createdAt: true,
    },
  })
}

// ========================================
// GYM PLANS (subscription plans offered by the gym)
// ========================================

export async function getGymPlans(gymId: string) {
  return prisma.gymPlan.findMany({
    where: { gymId },
    orderBy: { price: 'asc' },
  })
}

// ========================================
// EXPENSES
// ========================================

export async function getExpenses(gymId: string, page = 1, pageSize = 20) {
  const where = { gymId }
  const [expenses, total, monthAgg] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({
      where: {
        gymId,
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
  ])

  return {
    expenses,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    monthTotal: monthAgg._sum.amount || 0,
  }
}
