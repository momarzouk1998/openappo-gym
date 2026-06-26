import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PATCH /api/user/password — change current user's password
// Body: { currentPassword, newPassword }
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword } = body

  // Validation
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'كل الحقول مطلوبة' },
      { status: 400 }
    )
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: 'كلمة المرور الجديدة لازم 6 حروف على الأقل' },
      { status: 400 }
    )
  }

  const userId = session.user.id

  // Load current password hash
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })

  if (!user || !user.password) {
    return NextResponse.json(
      { error: 'حساب المستخدم غير موجود' },
      { status: 404 }
    )
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json(
      { error: 'كلمة المرور الحالية غير صحيحة' },
      { status: 401 }
    )
  }

  // Hash + update
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return NextResponse.json({ success: true })
}
