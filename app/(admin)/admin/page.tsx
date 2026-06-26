'use client'

import Link from 'next/link'
import { useAdminFetch } from '@/hooks/useAdminFetch'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Building2,
  CheckCircle2,
  Clock,
  PauseCircle,
  Wallet,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react'

interface AdminStats {
  totalGyms: number
  activeGyms: number
  trialGyms: number
  suspendedGyms: number
  totalMembers: number
  monthRevenue: number
  expectedRevenue: number
}

interface AdminGym {
  id: string
  name: string
  slug: string
  ownerName: string
  ownerEmail: string
  status: string
  basePlanPrice: number
  billingCycle: string
  addons: string[]
  nextBillingDate: string | null
  createdAt: string
}

interface AdminData {
  stats: AdminStats
  gyms: AdminGym[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'فعّال', color: 'text-[#22C55E] bg-[#22C55E]/10' },
  trial: { label: 'تجريبي', color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
  suspended: { label: 'معلّق', color: 'text-[#EF4444] bg-[#EF4444]/10' },
  cancelled: { label: 'ملغي', color: 'text-[#64748B] bg-[#64748B]/10' },
}

export default function AdminDashboard() {
  const { data, loading } = useAdminFetch<AdminData>('/api/admin/stats')

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  const { stats, gyms } = data
  const recentGyms = gyms.slice(0, 5)

  const gymStats = [
    { label: 'إجمالي الجيمات', value: stats.totalGyms, icon: Building2, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    { label: 'الجيمات الفعّالة', value: stats.activeGyms, icon: CheckCircle2, color: 'text-[#4ADE80]', bg: 'bg-[#4ADE80]/10' },
    { label: 'في التجربة', value: stats.trialGyms, icon: Clock, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
    { label: 'معلّقة', value: stats.suspendedGyms, icon: PauseCircle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
  ]

  const revenueStats = [
    { label: 'إيرادات هذا الشهر', value: formatCurrency(stats.monthRevenue), icon: Wallet },
    { label: 'الإيرادات المتوقعة', value: formatCurrency(stats.expectedRevenue), icon: TrendingUp },
    { label: 'إجمالي الأعضاء', value: stats.totalMembers, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl mb-1">نظرة عامة</h2>
        <p className="text-[#94A3B8]">إحصائيات المنصة والجيمات</p>
      </div>

      {/* Gym stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {gymStats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold font-cairo mb-1">{stat.value}</div>
            <div className="text-sm text-[#94A3B8]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {revenueStats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm text-[#94A3B8]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold font-cairo">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Gyms table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1F1F2E] flex items-center justify-between">
          <h3 className="font-cairo font-bold text-lg">أحدث الجيمات</h3>
          <Link href="/admin/gyms" className="text-sm text-[#22C55E] hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">الجيم</th>
                <th className="p-4 font-medium">المالك</th>
                <th className="p-4 font-medium">الباقة</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {recentGyms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#64748B]">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>مفيش جيمات مسجّلة بعد</p>
                  </td>
                </tr>
              ) : (
                recentGyms.map((gym) => {
                  const st = statusConfig[gym.status] || statusConfig.trial
                  return (
                    <tr key={gym.id} className="border-t border-[#1F1F2E] hover:bg-[#111118] transition-colors">
                      <td className="p-4 font-medium">{gym.name}</td>
                      <td className="p-4 text-sm text-[#94A3B8]">{gym.ownerName}</td>
                      <td className="p-4 text-sm">
                        <span className="text-[#22C55E]">
                          {gym.basePlanPrice >= 599 ? 'Pro' : 'Starter'}
                        </span>
                        {' '}
                        <span className="text-[#64748B]">{formatCurrency(gym.basePlanPrice)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#94A3B8]">{formatDate(gym.createdAt)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
