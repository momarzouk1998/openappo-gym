import { NextResponse } from 'next/server'

/**
 * GET /api/notifications/status
 * Check push notification subscription status.
 * Public endpoint — works on login page without auth.
 */
export async function GET() {
  return NextResponse.json({ subscribed: false })
}
