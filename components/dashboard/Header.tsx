'use client'

import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return <span className="w-9 h-9" aria-hidden />
  }

  const isLight = theme === 'light'
  return (
    <button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="p-2 text-muted-c hover:text-strong transition-colors rounded-lg hover:surface"
      aria-label={isLight ? 'الوضع الغامق' : 'الوضع الفاتح'}
      title={isLight ? 'الوضع الغامق' : 'الوضع الفاتح'}
    >
      {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  )
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-app/80 backdrop-blur-lg border-b border-app">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -mr-2 text-strong"
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-cairo font-bold text-lg sm:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          <NotificationBell />

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-sm font-cairo">
            م
          </div>
        </div>
      </div>
    </header>
  )
}
