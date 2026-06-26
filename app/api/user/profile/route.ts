import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/user/profile — update fullName and phone
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }

  const body = await request.json()
  const { fullName, phone } = body

  const userId = session.user.id

  // Update the Profile table (where id = userId, scoped to their gym)
  const updated = await prisma.profile.updateMany({
    where: { id: userId },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
    },
  })

  if (updated.count === 0) {
    // No profile row yet — create one with whatever data we have
    await prisma.profile.create({
      data: {
        id: userId,
        fullName: fullName || session.user.name || '',
        phone: phone || null,
        role: (session.user.role as any) || 'gym_owner',
      },
    })
  }

  // Also keep User.name in sync with fullName
  if (fullName) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: fullName },
    })
  }

  return NextResponse.json({
    success: true,
    fullName,
    phone,
  })
}
