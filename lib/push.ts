import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// Configure web-push with VAPID details (only if keys present)
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:noreply@opengym.app'

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  urgent?: boolean
}

/**
 * Send a push notification to all subscriptions owned by a user.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!publicKey || !privateKey) {
    console.warn('[push] VAPID keys missing — push disabled')
    return { sent: 0, failed: 0 }
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  const message = JSON.stringify(payload)
  let sent = 0
  const deadEndpoints: string[] = []

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode
        // 404 / 410 = subscription expired/unsubscribed → remove it
        if (status === 404 || status === 410) {
          deadEndpoints.push(sub.endpoint)
        } else {
          console.error('[push] send error:', status, (err as Error)?.message)
        }
      }
    })
  )

  // Clean up dead subscriptions
  if (deadEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: deadEndpoints } },
    })
  }

  return { sent, failed: subscriptions.length - sent }
}

/**
 * Broadcast a push notification to many users (e.g. all admins of a gym).
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.all(
    userIds.map((id) => sendPushToUser(id, payload))
  )
  return {
    sent: results.reduce((sum, r) => sum + r.sent, 0),
    failed: results.reduce((sum, r) => sum + r.failed, 0),
  }
}
