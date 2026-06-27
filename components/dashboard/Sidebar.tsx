'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGymStore } from '@/store/gym-store'
import { GymSwitcher } from '@/components/dashboard/GymSwitcher'
import {
  Home,
  Users,
  CreditCard,
  Wallet,
  Receipt,
  UserCog,
  Dumbbell,
  Calendar,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  X,
  UserCircle,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/dashboard/members', label: 'الأعضاء', icon: Users },
  { href: '/dashboard/subscriptions', label: 'الاشتراكات', icon: CreditCard },
  { href: '/dashboard/payments', label: 'المدفوعات', icon: Wallet },
]

const addonItems: { key: string; href: string; label: string; icon: any }[] = [
  {
    key: 'expenses',
    href: '/dashboard/expenses',
    label: 'المصروفات',
    icon: Receipt,
  },
  {
    key: 'staff',
    href: '/dashboard/staff',
    label: 'الموظفون',
    icon: UserCog,
  },
  {
    key: 'trainers',
    href: '/dashboard/trainers',
    label: 'المدربون',
    icon: Dumbbell,
  },
  {
    key: 'classes',
    href: '/dashboard/classes',
    label: 'الكلاسات',
    icon: Calendar,
  },
  {
    key: 'branches',
    href: '/dashboard/branches',
    label: 'الفروع',
    icon: Building2,
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, gym } = useGymStore()

  const gymName = gym?.name || 'جيمي'
  const userName = user?.fullName || user?.name || 'مستخدم'
  const userRole = user?.role || 'مدير'
  const userInitial = userName.charAt(0)

  // Read gym addons from the store (populated from /api/auth/me).
  // super_admin sees all addons so they can preview every section.
  const addons = userRole === 'super_admin'
    ? addonItems.map((a) => a.key)
    : gym?.addons || []
  const activeAddons = addonItems.filter((item) => addons.includes(item.key))

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-[#0A0A0F] border-l border-[#1F1F2E] z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F2E]">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-cairo font-bold text-lg">
                Open<span className="text-[#22C55E]">Gym</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-[#94A3B8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gym switcher */}
          <GymSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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

          {/* Addons section */}
          {activeAddons.length > 0 && (
            <>
              <div className="pt-4 pb-2 px-4">
                <span className="text-xs text-[#64748B] uppercase">
                  الإضافات
                </span>
              </div>
              {activeAddons.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
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
            </>
          )}

          {/* Reports */}
          <Link
            href="/dashboard/reports"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/reports')
                ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                : 'text-[#94A3B8] hover:bg-[#111118] hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">التقارير</span>
          </Link>

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/profile')
                ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                : 'text-[#94A3B8] hover:bg-[#111118] hover:text-white'
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-sm font-medium">الصفحة الشخصية</span>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/settings')
                ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                : 'text-[#94A3B8] hover:bg-[#111118] hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">الإعدادات</span>
          </Link>
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-[#1F1F2E]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-sm font-cairo">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{userName}</div>
              <div className="text-xs text-[#64748B]">{userRole === 'gym_owner' ? 'مالك' : userRole}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  )
}
