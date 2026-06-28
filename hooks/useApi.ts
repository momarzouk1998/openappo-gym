'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (!path || !gym?.slug) return

    // Abort previous in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const res = await fetch(`/api/gyms/${gym.slug}${path}`, {
        signal: controller.signal,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (!controller.signal.aborted) {
        setState({ data, loading: false, error: null })
      }
      return data
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null
      const message = err instanceof Error ? err.message : 'حدث خطأ'
      if (!controller.signal.aborted) {
        setState((prev) => ({ ...prev, loading: false, error: message }))
      }
      return null
    }
  }, [path, gym?.slug])

  useEffect(() => {
    if (initialized && gym?.slug && path) {
      fetchData()
    }
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchData, initialized, gym?.slug, path])

  return { ...state, refetch: fetchData }
}

// For POST/PUT/DELETE requests
export function useApiMutation() {
  const gym = useGymStore((s) => s.gym)
  const abortRef = useRef<AbortController | null>(null)

  const mutate = useCallback(
    async (method: string, path: string, body?: unknown) => {
      if (!gym?.slug) {
        return { error: 'لا يوجد جيم محدد', data: null }
      }

      // Abort previous mutation
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/gyms/${gym.slug}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          return { error: data.error || `HTTP ${res.status}`, data: null }
        }

        return { error: null, data }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return { error: null, data: null }
        }
        const message = err instanceof Error ? err.message : 'حدث خطأ'
        return { error: message, data: null }
      }
    },
    [gym?.slug]
  )

  return { mutate }
}
