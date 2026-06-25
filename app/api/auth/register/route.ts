import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'
import type { AddonKey } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      gymName,
      gymPhone,
      city,
      address,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      plan,
      addons,
    } = body

    // Validation
    if (!gymName || !ownerName || !ownerEmail || !ownerPassword) {
      return NextResponse.json(
        { error: 'بيانات ناقصة. املأ الحقول المطلوبة.' },
        { status: 400 }
      )
    }

    if (ownerPassword.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور لازم 6 حروف على الأقل' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجّل بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 12)

    // Generate unique slug
    let slug = slugify(gymName)
    const existingGym = await prisma.gym.findUnique({ where: { slug } })
    if (existingGym) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const basePlanPrice = plan === 'pro' ? 599 : 299

    // Create gym + user + profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create gym
      const gym = await tx.gym.create({
        data: {
          name: gymName,
          slug,
          phone: gymPhone || null,
          city: city || null,
          address: address || null,
          ownerName,
          ownerPhone: ownerPhone || '',
          ownerEmail,
          status: 'trial',
          basePlanPrice,
          addons: (addons || []) as AddonKey[],
        },
      })

      // 2. Create main branch
      await tx.branch.create({
        data: {
          gymId: gym.id,
          name: 'الفرع الرئيسي',
          isMain: true,
        },
      })

      // 3. Create user
      const user = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
        },
      })

      // 4. Create profile (gym_owner role)
      await tx.profile.create({
        data: {
          id: user.id,
          gymId: gym.id,
          role: 'gym_owner',
          fullName: ownerName,
          phone: ownerPhone || null,
          isActive: true,
        },
      })

      // 5. Create default subscription plan
      await tx.gymPlan.create({
        data: {
          gymId: gym.id,
          name: 'شهري',
          duration: 30,
          price: 300,
        },
      })

      await tx.gymPlan.create({
        data: {
          gymId: gym.id,
          name: 'ثلاثة أشهر',
          duration: 90,
          price: 800,
        },
      })

      return { gym, user }
    })

    return NextResponse.json({
      success: true,
      gymId: result.gym.id,
      userId: result.user.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.' },
      { status: 500 }
    )
  }
}
