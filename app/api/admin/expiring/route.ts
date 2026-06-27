import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getExpiringSubscriptionsAdmin,
  getExpiredSubscriptionsAdmin,
} from '@/lib/queries'

// GET /api/admin/expiring — cross-gym expiring + expired subscriptions
// Super-admin only. Returns gym name so admin can identify each.
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مسجّل الدخول' }, { status: 401 })
  }
  if (session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'ممنوع' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')

  const [expiring, expired] = await Promise.all([
    getExpiringSubscriptionsAdmin(days),
    getExpiredSubscriptionsAdmin(),
  ])

  return NextResponse.json({ expiring, expired })
}
