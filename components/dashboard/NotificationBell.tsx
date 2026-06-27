'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, BellOff } from 'lucide-react'

interface NotificationBellProps {
  /** Number of unread notifications — 0 or undefined hides the dot */
  unreadCount?: number
  /** Optional notification items to show in the dropdown */
  notifications?: {
    id: string
    title: string
    body: string
    time: string
    read: boolean
  }[]
}

/**
 * Reusable notification bell with dropdown panel and conditional unread dot.
 *
 * Behaviour:
 * - Click toggles the dropdown.
 * - Green dot appears only when `unreadCount > 0`.
 * - Empty state shown when there are no notifications.
 * - Closes on click-outside.
 */
export function NotificationBell({
  unreadCount = 0,
  notifications = [],
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  const hasUnread = unreadCount > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-muted-c hover:text-strong transition-colors rounded-lg hover:surface"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-app border border-app rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-app">
            <h3 className="font-cairo font-bold text-sm">الإشعارات</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-muted-c hover:text-strong transition-colors rounded-lg hover:surface"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <BellOff className="w-10 h-10 text-faint mb-3" />
                <p className="text-sm text-muted-c">لا توجد إشعارات حالياً</p>
                <p className="text-xs text-faint mt-1">
                  ستظهر هنا التنبيهات المتعلقة باشتراكات الجيم
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-app">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 transition-colors hover:surface ${
                      !n.read ? 'bg-[#22C55E]/5' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-strong">{n.title}</p>
                    <p className="text-xs text-muted-c mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-faint mt-1">{n.time}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
