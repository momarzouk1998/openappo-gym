'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Building2, Search, Loader2 } from 'lucide-react'

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
  cancelled: { label: 'ملغي', color: 'text-[#64748B] bg-[#64748B]/10' },
}

export default function AdminGymsPage() {
  const { data, loading } = useAdminFetch<AdminData>('/api/admin/stats')
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
        <p className="text-sm text-[#94A3B8]">
          كل الجيمات المسجّلة على المنصة ({allGyms.length})
        </p>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الجيم أو المالك أو الإيميل..."
            className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 pr-11 pl-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#22C55E]/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">الجيم</th>
                <th className="p-4 font-medium">المالك</th>
                <th className="p-4 font-medium">الباقة</th>
                <th className="p-4 font-medium">الإضافات</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#22C55E]" />
                    <p className="text-[#64748B]">جاري التحميل...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-[#64748B]">
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
                      className="border-t border-[#1F1F2E] hover:bg-[#111118] transition-colors"
                    >
                      <td className="p-4 font-medium">{gym.name}</td>
                      <td className="p-4">
                        <div className="text-sm">{gym.ownerName}</div>
                        <div className="text-xs text-[#64748B]" dir="ltr">
                          {gym.ownerEmail}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className="text-[#22C55E]">
                          {gym.basePlanPrice >= 599 ? 'Pro' : 'Starter'}
                        </span>
                        <div className="text-xs text-[#64748B]">
                          {formatCurrency(gym.basePlanPrice)}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#94A3B8]">
                        {gym.addons.length > 0 ? gym.addons.length + ' إضافة' : 'لا يوجد'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#94A3B8]">
                        {formatDate(gym.createdAt)}
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
