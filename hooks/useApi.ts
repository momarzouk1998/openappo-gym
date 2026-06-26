'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGymStore } from '@/store/gym-store'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(path: string | null) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  const gym = useGymStore((s) => s.gym)
  const initialized = useGymStore((s) => s.initialized)

  const fetchData = useCallback(async () => {
    if (!path || !gym?.slug) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const res = await fetch(`/api/gyms/${gym.slug}${path}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return null
    }
  }, [path, gym?.slug])

  useEffect(() => {
    if (initialized && gym?.slug && path) {
      fetchData()
    }
  }, [fetchData, initialized, gym?.slug, path])

  return { ...state, refetch: fetchData }
}

// For POST/PUT/DELETE requests
export function useApiMutation() {
  const gym = useGymStore((s) => s.gym)

  const mutate = useCallback(
    async (method: string, path: string, body?: unknown) => {
      if (!gym?.slug) {
        return { error: 'لا يوجد جيم محدد', data: null }
      }

      try {
        const res = await fetch(`/api/gyms/${gym.slug}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          return { error: data.error || `HTTP ${res.status}`, data: null }
        }

        return { error: null, data }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'حدث خطأ'
        return { error: message, data: null }
      }
    },
    [gym?.slug]
  )

  return { mutate }
}
