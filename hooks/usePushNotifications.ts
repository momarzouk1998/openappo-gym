'use client'

import { useState, useEffect, useCallback } from 'react'

interface PushState {
  supported: boolean
  permission: NotificationPermission
  subscribed: boolean
  loading: boolean
}

/**
 * Hook to manage browser push notification subscription.
 * Handles: permission check, subscription, unsubscription.
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: 'default',
    subscribed: false,
    loading: false,
  })

  // Check support & permission on mount
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    if (supported) {
      setState((s) => ({
        ...s,
        supported,
        permission: Notification.permission,
      }))

      // Check if already subscribed on server
      fetch('/api/notifications/status', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.subscribed) {
            setState((s) => ({ ...s, subscribed: true }))
          }
        })
        .catch(() => {
          /* ignore */
        })

      // Listen for permission changes (e.g. from browser settings)
      const handler = () => {
        setState((s) => ({
          ...s,
          permission: Notification.permission,
        }))
      }
      Notification.addEventListener?.('permissionchange', handler)
      return () => {
        Notification.removeEventListener?.('permissionchange', handler)
      }
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) return false

    if (Notification.permission === 'granted') return true

    if (Notification.permission === 'denied') return false

    try {
      const result = await Notification.requestPermission()
      setState((s) => ({ ...s, permission: result }))
      return result === 'granted'
    } catch {
      return false
    }
  }, [state.supported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.supported) return false

    setState((s) => ({ ...s, loading: true }))

    try {
      // 1. Request permission first
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        setState((s) => ({ ...s, loading: false }))
        return false
      }

      // 2. Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // 3. Get VAPID public key from env
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) {
        console.error('[push] VAPID public key missing')
        setState((s) => ({ ...s, loading: false }))
        return false
      }

      // 4. Convert base64 key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey)

      // 5. Subscribe via PushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      // 6. Send subscription to server
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON()),
      })

      if (res.ok) {
        setState((s) => ({ ...s, subscribed: true, loading: false }))
        return true
      }

      setState((s) => ({ ...s, loading: false }))
      return false
    } catch (error) {
      console.error('[push] subscribe error:', error)
      setState((s) => ({ ...s, loading: false }))
      return false
    }
  }, [state.supported, requestPermission])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Remove from server
        await fetch('/api/notifications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        // Remove from browser
        await subscription.unsubscribe()
      }

      setState((s) => ({ ...s, subscribed: false, loading: false }))
      return true
    } catch (error) {
      console.error('[push] unsubscribe error:', error)
      setState((s) => ({ ...s, loading: false }))
      return false
    }
  }, [])

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}

/**
 * Convert a base64 VAPID key to Uint8Array (browser-compatible).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
