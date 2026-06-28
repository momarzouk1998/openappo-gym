import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserGyms } from '@/lib/gym-context'

// GET /api/auth/me — returns current user + gym + all user's gyms
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }

  const userId = session.user.id
  const role = session.user.role || 'gym_owner'

  // Get user gyms (returns { gyms, total, page, pageSize, totalPages })
  const { gyms, total, page, pageSize, totalPages } = await getUserGyms(userId, role)

  // Determine the active gym
  let activeGym = null
  if (session.user.gymId) {
    const gymData = gyms.find((g) => g.id === session.user.gymId)
    activeGym = gymData || gyms[0] || null
  } else {
    activeGym = gyms[0] || null
  }

  // Get user profile
  let profile: { fullName: string | null; phone: string | null; role: string } | null = null
  if (activeGym) {
    profile = await prisma.profile.findUnique({
      where: { id: userId, gymId: activeGym.id },
      select: { fullName: true, phone: true, role: true },
    })
  } else if (role === 'super_admin') {
    profile = await prisma.profile.findFirst({
      where: { id: userId },
      select: { fullName: true, phone: true, role: true },
    })
  }

  return NextResponse.json({
    user: {
      id: userId,
      name: session.user.name,
      email: session.user.email,
      role,
      fullName: profile?.fullName || session.user.name || '',
    },
    profile: {
      phone: profile?.phone || '',
    },
    gym: activeGym
      ? {
          id: activeGym.id,
          name: activeGym.name,
          slug: activeGym.slug,
          status: activeGym.status,
          logoUrl: activeGym.logoUrl,
          addons: activeGym.addons,
          trialEndsAt: activeGym.trialEndsAt,
          basePlanPrice: activeGym.basePlanPrice,
        }
      : null,
    gyms,
    gymsPagination: { total, page, pageSize, totalPages },
  })
}
