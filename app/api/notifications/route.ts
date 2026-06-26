import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/notifications/subscribe
 * Save or update a push subscription for the authenticated user.
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    if (!token?.sub) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'بيانات الاشتراك غير مكتملة' },
        { status: 400 }
      )
    }

    // Upsert: if endpoint exists for this user, update it; otherwise create
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: token.sub,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: request.headers.get('user-agent') || null,
      },
      update: {
        userId: token.sub,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[notifications/subscribe] error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الاشتراك' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/unsubscribe
 * Remove a push subscription.
 * Body: { endpoint }
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    if (!token?.sub) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'بيانات غير مكتملة' },
        { status: 400 }
      )
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: token.sub },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[notifications/unsubscribe] error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إلغاء الاشتراك' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notifications/status
 * Check if the current user has an active push subscription.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    if (!token?.sub) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const count = await prisma.pushSubscription.count({
      where: { userId: token.sub },
    })

    return NextResponse.json({ subscribed: count > 0 })
  } catch (error) {
    console.error('[notifications/status] error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
