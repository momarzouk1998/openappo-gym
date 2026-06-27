import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// POST /api/auth/reset-password
// Body: { email, token, newPassword }
// Verifies the token against the stored bcrypt hash, checks expiry + not-used,
// then updates the user's password.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').toString().trim().toLowerCase()
  const token = (body.token || '').toString()
  const newPassword = (body.newPassword || '').toString()

  if (!email || !token || !newPassword) {
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

  // Look up the most recent unused, non-expired token for this email
  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      email,
      used: false,
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!resetRecord) {
    return NextResponse.json(
      { error: 'الرابط غير صالح أو انتهت صلاحيته. اطلب رابط جديد.' },
      { status: 400 }
    )
  }

  // Compare plaintext token against the stored bcrypt hash
  const tokenValid = await bcrypt.compare(token, resetRecord.token)
  if (!tokenValid) {
    return NextResponse.json(
      { error: 'الرابط غير صالح. اطلب رابط جديد.' },
      { status: 400 }
    )
  }

  // Verify the user still exists
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json(
      { error: 'الحساب غير موجود' },
      { status: 404 }
    )
  }

  // Hash + update the password
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  // Mark the token as used so it can't be replayed
  await prisma.passwordReset.update({
    where: { id: resetRecord.id },
    data: { used: true },
  })

  return NextResponse.json({ success: true })
}
