'use client'

import { Menu, Bell } from 'lucide-react'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#1F1F2E]">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -mr-2 text-white"
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-cairo font-bold text-lg sm:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="relative p-2 text-[#94A3B8] hover:text-white transition-colors"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-sm font-cairo">
            م
          </div>
        </div>
      </div>
    </header>
  )
}
