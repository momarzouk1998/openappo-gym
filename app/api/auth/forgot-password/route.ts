import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

// POST /api/auth/forgot-password
// Body: { email }
// Always returns 200 (generic msg) whether or not the email exists — this
// prevents account enumeration (an attacker can't tell which emails are real).
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').toString().trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'البريد الإلكتروني غير صالح' },
      { status: 400 }
    )
  }

  // Check if a user exists with this email
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    // Pretend success to avoid enumeration. Do NOT send an email.
    return NextResponse.json({
      message: 'لو الإيميل مسجّل، هتوصلك رسالة بتغيير كلمة المرور',
    })
  }

  // Generate a random plaintext token + store its bcrypt hash in the DB.
  const plaintextToken = randomBytes(32).toString('hex')
  const hashedToken = await bcrypt.hash(plaintextToken, 12)

  // Invalidate any previous unused tokens for this email
  await prisma.passwordReset.updateMany({
    where: { email, used: false },
    data: { used: true },
  })

  // Create new token, valid for 1 hour
  await prisma.passwordReset.create({
    data: {
      email,
      token: hashedToken,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  // Send the email. We pass the PLAINTEXT token in the link.
  const result = await sendPasswordResetEmail(email, plaintextToken)
  if (!result.success) {
    console.error('[forgot-password] email send failed:', result.error)
    // Still return generic success to avoid leaking, but log it
  }

  return NextResponse.json({
    message: 'لو الإيميل مسجّل، هتوصلك رسالة بتغيير كلمة المرور',
    // In dev/no-key mode the email is skipped and the link is logged —
    // we surface a hint so the flow can be tested locally.
    _devHint: result.skipped ? 'dev mode: link logged to server console' : undefined,
  })
}
