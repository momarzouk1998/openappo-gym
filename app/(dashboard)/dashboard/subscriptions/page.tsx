'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGymStore } from '@/store/gym-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CreditCard,
  Search,
  Loader2,
  Snowflake,
  Play,
  XCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

interface Subscription {
  id: string
  startDate: string
  endDate: string
  price: number
  discount: number
  finalPrice: number
  status: string
  frozenAt: string | null
  member: { id: string; fullName: string; phone: string | null; memberNumber: string }
  plan: { id: string; name: string; duration: number }
}

interface SubsResponse {
  subscriptions: Subscription[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  stats: { active: number; expired: number; frozen: number }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'فعّال', color: 'text-[#22C55E] bg-[#22C55E]/10' },
  expired: { label: 'منتهي', color: 'text-[#EF4444] bg-[#EF4444]/10' },
  frozen: { label: 'مجمّد', color: 'text-[#3B82F6] bg-[#3B82F6]/10' },
  cancelled: { label: 'ملغي', color: 'text-[#64748B] bg-[#64748B]/10' },
}

export default function SubscriptionsPage() {
  const { gym } = useGymStore()
  const gymSlug = gym?.slug

  const [subs, setSubs] = useState<Subscription[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ active: 0, expired: 0, frozen: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSubs = useCallback(
    async (p = 1, s = '', status = 'all') => {
      if (!gymSlug) return
      setLoading(true)

      const params = new URLSearchParams({ page: String(p), status })
      if (s) params.set('search', s)

      try {
        const res = await fetch(`/api/gyms/${gymSlug}/subscriptions?${params}`)
        if (!res.ok) throw new Error('فشل تحميل الاشتراكات')
        const data: SubsResponse = await res.json()
        setSubs(data.subscriptions)
        setTotal(data.total)
        setPage(data.page)
        setTotalPages(data.totalPages)
        setStats(data.stats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [gymSlug]
  )

  useEffect(() => {
    if (!gymSlug) return
    const timer = setTimeout(() => {
      fetchSubs(1, search, statusFilter)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, statusFilter, gymSlug, fetchSubs])

  const handleAction = async (subId: string, action: 'freeze' | 'unfreeze' | 'cancel') => {
    if (!gymSlug) return
    setActionLoading(subId)
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/subscriptions/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'فشل الإجراء')
      }
      // Refetch current view
      fetchSubs(page, search, statusFilter)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const statCards = [
    { label: 'فعّالة', value: stats.active, color: 'text-[#22C55E]' },
    { label: 'منتهية', value: stats.expired, color: 'text-[#EF4444]' },
    { label: 'مجمّدة', value: stats.frozen, color: 'text-[#3B82F6]' },
    { label: 'الإجمالي', value: total, color: 'text-[#F59E0B]' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الاشتراكات</h2>
        <p className="text-sm text-[#94A3B8]">إدارة اشتراكات الأعضاء</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className={`text-3xl font-bold font-cairo mb-1 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-[#94A3B8]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم العضو أو التليفون..."
              className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 pr-11 pl-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#22C55E]/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 sm:w-44"
          >
            <option value="all">كل الحالات</option>
            <option value="active">فعّال</option>
            <option value="expired">منتهي</option>
            <option value="frozen">مجمّد</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">العضو</th>
                <th className="p-4 font-medium">الخطة</th>
                <th className="p-4 font-medium">البداية</th>
                <th className="p-4 font-medium">النهاية</th>
                <th className="p-4 font-medium">المبلغ</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#22C55E]" />
                    <p className="text-[#64748B]">جاري التحميل...</p>
                  </td>
                </tr>
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-[#64748B]">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-1">مفيش اشتراكات</p>
                    <p className="text-sm">أضف اشتراك من خلال إضافة عضو جديد</p>
                  </td>
                </tr>
              ) : (
                subs.map((sub) => {
                  const st = statusConfig[sub.status] || statusConfig.active
                  return (
                    <tr
                      key={sub.id}
                      className="border-t border-[#1F1F2E] hover:bg-[#111118] transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium">{sub.member.fullName}</div>
                        <div className="text-xs text-[#64748B] font-mono" dir="ltr">
                          {sub.member.memberNumber}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{sub.plan.name}</td>
                      <td className="p-4 text-sm text-[#94A3B8]">
                        {formatDate(sub.startDate)}
                      </td>
                      <td className="p-4 text-sm text-[#94A3B8]">
                        {formatDate(sub.endDate)}
                      </td>
                      <td className="p-4 font-medium text-[#22C55E]">
                        {formatCurrency(sub.finalPrice)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleAction(sub.id, 'freeze')}
                              disabled={actionLoading === sub.id}
                              title="تجميد"
                              className="p-1.5 rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/10 disabled:opacity-50"
                            >
                              <Snowflake className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status === 'frozen' && (
                            <button
                              onClick={() => handleAction(sub.id, 'unfreeze')}
                              disabled={actionLoading === sub.id}
                              title="إلغاء التجميد"
                              className="p-1.5 rounded-lg text-[#22C55E] hover:bg-[#22C55E]/10 disabled:opacity-50"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {(sub.status === 'active' || sub.status === 'frozen') && (
                            <button
                              onClick={() => handleAction(sub.id, 'cancel')}
                              disabled={actionLoading === sub.id}
                              title="إلغاء"
                              className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchSubs(page - 1, search, statusFilter)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-[#1F1F2E] disabled:opacity-30 hover:bg-[#111118] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm text-[#94A3B8]">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => fetchSubs(page + 1, search, statusFilter)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-[#1F1F2E] disabled:opacity-30 hover:bg-[#111118] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
