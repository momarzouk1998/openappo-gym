'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminFetch } from '@/hooks/useAdminFetch'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Building2, Search, Loader2, ChevronLeft } from 'lucide-react'

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
  stats: Record<string, number>
  gyms: AdminGym[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'فعّال', color: 'text-[#22C55E] bg-[#22C55E]/10' },
  trial: { label: 'تجريبي', color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
  suspended: { label: 'معلّق', color: 'text-[#EF4444] bg-[#EF4444]/10' },
  cancelled: { label: 'ملغي', color: 'text-faint bg-[#64748B]/10' },
}

export default function AdminGymsPage() {
  const { data, loading } = useAdminFetch<AdminData>('/api/admin/stats')
  const router = useRouter()
  const [search, setSearch] = useState('')

  const allGyms = data?.gyms || []
  const filtered = allGyms.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      g.ownerEmail.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الجيمات</h2>
        <p className="text-sm text-muted-c">
          كل الجيمات المسجّلة على المنصة ({allGyms.length})
        </p>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الجيم أو المالك أو الإيميل..."
            className="w-full bg-app border border-app rounded-xl py-3 pr-11 pl-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="surface text-sm text-faint">
              <tr>
                <th className="p-4 font-medium">الجيم</th>
                <th className="p-4 font-medium">المالك</th>
                <th className="p-4 font-medium">الباقة</th>
                <th className="p-4 font-medium">الإضافات</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">تاريخ التسجيل</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#22C55E]" />
                    <p className="text-faint">جاري التحميل...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-faint">
                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-1">مفيش جيمات مسجّلة بعد</p>
                    <p className="text-sm">لما يسجّل أصحاب الجيمات، هتظهر هنا</p>
                  </td>
                </tr>
              ) : (
                filtered.map((gym) => {
                  const st = statusConfig[gym.status] || statusConfig.trial
                  return (
                    <tr
                      key={gym.id}
                      onClick={() => router.push(`/admin/gyms/${gym.id}`)}
                      className="border-t border-app hover:surface transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-medium">{gym.name}</td>
                      <td className="p-4">
                        <div className="text-sm">{gym.ownerName}</div>
                        <div className="text-xs text-faint" dir="ltr">
                          {gym.ownerEmail}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="text-[#22C55E]">
                          {gym.basePlanPrice >= 599 ? 'Pro' : 'Starter'}
                        </span>
                        <div className="text-xs text-faint">
                          {formatCurrency(gym.basePlanPrice)}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-c">
                        {gym.addons.length > 0 ? gym.addons.length + ' إضافة' : 'لا يوجد'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-c">
                        {formatDate(gym.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-[#22C55E] text-sm font-medium">
                          تحكم
                          <ChevronLeft className="w-4 h-4" />
                        </span>
                      </td>
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
