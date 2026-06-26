'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { GymProvider } from '@/components/GymProvider'

const pageTitles: Record<string, string> = {
  '/dashboard': 'الرئيسية',
  '/dashboard/members': 'الأعضاء',
  '/dashboard/members/new': 'إضافة عضو',
  '/dashboard/subscriptions': 'الاشتراكات',
  '/dashboard/payments': 'المدفوعات',
  '/dashboard/expenses': 'المصروفات',
  '/dashboard/staff': 'الموظفون',
  '/dashboard/trainers': 'المدربون',
  '/dashboard/classes': 'الكلاسات',
  '/dashboard/branches': 'الفروع',
  '/dashboard/reports': 'التقارير',
  '/dashboard/settings': 'الإعدادات',
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const getCurrentTitle = () => {
    const keys = Object.keys(pageTitles).sort((a, b) => b.length - a.length)
    for (const key of keys) {
      if (pathname === key || pathname.startsWith(key + '/')) {
        return pageTitles[key]
      }
    }
    return 'لوحة التحكم'
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 min-w-0">
          <Header
            title={getCurrentTitle()}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GymProvider>
      <DashboardShell>{children}</DashboardShell>
    </GymProvider>
  )
}
