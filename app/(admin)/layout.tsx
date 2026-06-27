'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Receipt,
  LogOut,
  Dumbbell,
  Menu,
  X,
  Bell,
  Settings2,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const adminNav = [
  { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/admin/gyms', label: 'الجيمات', icon: Building2 },
  { href: '/admin/config', label: 'الأسعار', icon: Settings2 },
  { href: '/admin/billing', label: 'الفواتير', icon: Receipt },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="flex">
        {/* Mobile overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-[#0A0A0F] border-l border-[#1F1F2E] z-50 transition-transform duration-300 flex flex-col ${
            open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-5 border-b border-[#1F1F2E]">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-cairo font-bold text-lg">
                  Open<span className="text-[#22C55E]">Gym</span>
                </div>
                <div className="text-xs text-[#22C55E]">لوحة الأدمن</div>
              </div>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden absolute top-5 left-5 text-[#94A3B8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                    : 'text-[#94A3B8] hover:bg-[#111118] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#1F1F2E]">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#1F1F2E]">
            <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="lg:hidden p-2 -mr-2 text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="font-cairo font-bold text-lg sm:text-xl">
                  لوحة تحكم الأدمن
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-[#94A3B8] hover:text-white">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-sm">
                  م
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
