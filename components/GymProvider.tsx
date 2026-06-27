'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useGymStore } from '@/store/gym-store'
import { Loader2 } from 'lucide-react'

interface GymProviderProps {
  children: React.ReactNode
}

export function GymProvider({ children }: GymProviderProps) {
  const { data: session, status } = useSession()
  const { initialize, initialized, reset } = useGymStore()
  const initRef = useRef(false)

  useEffect(() => {
    // Reset when session changes (logout)
    if (status === 'unauthenticated') {
      reset()
      return
    }

    if (status === 'authenticated' && session?.user?.id && !initRef.current) {
      initRef.current = true

      fetch('/api/auth/me')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch gym data')
          return res.json()
        })
        .then((data) => {
          initialize({
            gym: data.gym,
            user: data.user,
            gyms: data.gyms,
          })
        })
        .catch((err) => {
          console.error('Failed to initialize gym store:', err)
          initRef.current = false
        })
    }
  }, [session, status, initialize, reset])

  // Reset initRef when session changes
  useEffect(() => {
    if (status === 'loading') {
      initRef.current = false
    }
  }, [status])

  // Show loading while initializing (but not if we already have data)
  if (!initialized && status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  return <>{children}</>
}
