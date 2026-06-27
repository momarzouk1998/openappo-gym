'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGymStore } from '@/store/gym-store'
import { formatDate } from '@/lib/utils'
import { Dumbbell, Plus, Search, Loader2, ChevronRight, ChevronLeft, Pencil, Trash2, X, Phone } from 'lucide-react'

interface Trainer { id: string; fullName: string | null; phone: string | null; branchId: string | null; isActive: boolean; createdAt: string }
interface TrainersResponse { trainers: Trainer[]; total: number; page: number; pageSize: number; totalPages: number; stats: { totalClasses: number; totalMembers: number } }
interface BranchOption { id: string; name: string }

export default function TrainersPage() {
  const { gym } = useGymStore()
  const gymSlug = gym?.slug
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalClasses: 0, totalMembers: 0 })
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [branchMap, setBranchMap] = useState<Record<string, string>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Trainer | null>(null)
  const [form, setForm] = useState({ fullName: '', phone: '', branchId: '' })
  const [saving, setSaving] = useState(false)

  const fetchTrainers = useCallback(async (p = 1, s = '') => {
    if (!gymSlug) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (s) params.set('search', s)
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/trainers?${params}`)
      if (!res.ok) throw new Error()
      const data: TrainersResponse = await res.json()
      setTrainers(data.trainers); setTotal(data.total); setPage(data.page); setTotalPages(data.totalPages)
      setStats(data.stats)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [gymSlug])

  const fetchBranches = useCallback(async () => {
    if (!gymSlug) return
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/branches`)
      if (res.ok) {
        const data = await res.json()
        setBranches(data.branches || [])
        const map: Record<string, string> = {}
        ;(data.branches || []).forEach((b: BranchOption) => { map[b.id] = b.name })
        setBranchMap(map)
      }
    } catch { /* ignore */ }
  }, [gymSlug])

  useEffect(() => { if (gymSlug) fetchBranches() }, [gymSlug, fetchBranches])

  useEffect(() => {
    if (!gymSlug) return
    const timer = setTimeout(() => fetchTrainers(1, search), 350)
    return () => clearTimeout(timer)
  }, [search, gymSlug, fetchTrainers])

  const openAdd = () => { setEditing(null); setForm({ fullName: '', phone: '', branchId: '' }); setModalOpen(true) }
  const openEdit = (t: Trainer) => { setEditing(t); setForm({ fullName: t.fullName || '', phone: t.phone || '', branchId: t.branchId || '' }); setModalOpen(true) }

  const handleSave = async () => {
    if (!gymSlug || !form.fullName.trim()) return
    setSaving(true)
    try {
      const url = editing ? `/api/gyms/${gymSlug}/trainers/${editing.id}` : `/api/gyms/${gymSlug}/trainers`
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName.trim(), phone: form.phone || null, branchId: form.branchId || null }),
      })
      if (!res.ok) throw new Error()
      setModalOpen(false)
      fetchTrainers(page, search)
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!gymSlug || !confirm('هل أنت متأكد من حذف هذا المدرب؟')) return
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/trainers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      fetchTrainers(page, search)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-cairo font-bold text-2xl">المدربون</h2>
          <p className="text-sm text-muted-c">إجمالي المدربين: {total}</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors">
          <Plus className="w-4 h-4" /> إضافة مدرب
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm text-faint mb-1">المدربين</p>
          <p className="text-xl font-bold text-strong">{total}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm text-faint mb-1">الكلاسات</p>
          <p className="text-xl font-bold text-[#3B82F6]">{stats.totalClasses}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm text-faint mb-1">الأعضاء المتدربين</p>
          <p className="text-xl font-bold text-[#22C55E]">{stats.totalMembers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو التليفون..." className="w-full bg-app border border-app rounded-xl py-3 pr-11 pl-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="surface text-sm text-faint">
              <tr>
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">التليفون</th>
                <th className="p-4 font-medium">الفرع</th>
                <th className="p-4 font-medium">تاريخ الانضمام</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-16 text-center"><Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#22C55E]" /><p className="text-faint">جاري التحميل...</p></td></tr>
              ) : trainers.length === 0 ? (
                <tr><td colSpan={5} className="p-16 text-center text-faint">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg mb-1">مفيش مدربين بعد</p>
                  <p className="text-sm">ابدأ بإضافة أول مدرب في جيمك</p>
                  <button onClick={openAdd} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors"><Plus className="w-4 h-4" /> إضافة أول مدرب</button>
                </td></tr>
              ) : trainers.map((t) => (
                <tr key={t.id} className="border-t border-app hover:surface transition-colors">
                  <td className="p-4 font-medium">{t.fullName || '—'}</td>
                  <td className="p-4">
                    {t.phone ? (
                      <a href={`tel:${t.phone}`} className="flex items-center gap-1 text-muted-c hover:text-[#22C55E] transition-colors" dir="ltr"><Phone className="w-3.5 h-3.5" />{t.phone}</a>
                    ) : (<span className="text-faint">—</span>)}
                  </td>
                  <td className="p-4 text-sm text-muted-c">{t.branchId ? branchMap[t.branchId] || '—' : '—'}</td>
                  <td className="p-4 text-sm text-muted-c">{formatDate(t.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:surface transition-colors text-faint hover:text-[#22C55E]"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:surface transition-colors text-faint hover:text-[#EF4444]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchTrainers(page - 1, search)} disabled={page === 1} className="p-2 rounded-lg border border-app disabled:opacity-30 hover:surface transition-colors"><ChevronRight className="w-4 h-4" /></button>
          <span className="px-4 py-2 text-sm text-muted-c">صفحة {page} من {totalPages}</span>
          <button onClick={() => fetchTrainers(page + 1, search)} disabled={page === totalPages} className="p-2 rounded-lg border border-app disabled:opacity-30 hover:surface transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-app border border-app rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cairo font-bold text-lg">{editing ? 'تعديل المدرب' : 'إضافة مدرب'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-faint hover:text-strong"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-faint mb-1">الاسم</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="اسم المدرب" className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50" />
              </div>
              <div>
                <label className="block text-sm text-faint mb-1">التليفون</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم التليفون" className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50" />
              </div>
              <div>
                <label className="block text-sm text-faint mb-1">الفرع</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong focus:outline-none focus:border-[#22C55E]/50">
                  <option value="">بدون فرع</option>
                  {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-50">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-app text-strong rounded-xl text-sm font-semibold hover:surface transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
