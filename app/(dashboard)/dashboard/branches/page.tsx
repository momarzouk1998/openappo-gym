'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGymStore } from '@/store/gym-store'
import { Building2, Plus, Loader2, Pencil, Trash2, X, Phone, MapPin, Users, UserCog, Dumbbell, Star, Search } from 'lucide-react'

interface BranchItem {
  id: string
  name: string
  address: string | null
  phone: string | null
  isMain: boolean
  isActive: boolean
  createdAt: string
  _count: { members: number; profiles: number; classes: number }
}
interface BranchesResponse {
  branches: BranchItem[]
  total: number
  totalMembers: number
}
interface FormState { name: string; address: string; phone: string; isMain: boolean }

export default function BranchesPage() {
  const { gym } = useGymStore()
  const gymSlug = gym?.slug
  const [branches, setBranches] = useState<BranchItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalMembers, setTotalMembers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BranchItem | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', address: '', phone: '', isMain: false })
  const [saving, setSaving] = useState(false)

  const fetchBranches = useCallback(async () => {
    if (!gymSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/branches`)
      if (!res.ok) throw new Error()
      const data: BranchesResponse = await res.json()
      setBranches(data.branches || [])
      setTotal(data.total || 0)
      setTotalMembers(data.totalMembers || 0)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [gymSlug])

  useEffect(() => { fetchBranches() }, [fetchBranches])

  // فلترة محلية بالبحث (الـ API مفيهوش search param)
  const filtered = search.trim()
    ? branches.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.phone || '').includes(search)
      )
    : branches

  const openAdd = () => { setEditing(null); setForm({ name: '', address: '', phone: '', isMain: branches.length === 0 }); setModalOpen(true) }
  const openEdit = (b: BranchItem) => { setEditing(b); setForm({ name: b.name, address: b.address || '', phone: b.phone || '', isMain: b.isMain }); setModalOpen(true) }

  const handleSave = async () => {
    if (!gymSlug || !form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address || null,
        phone: form.phone || null,
        isMain: form.isMain,
      }
      const url = editing ? `/api/gyms/${gymSlug}/branches/${editing.id}` : `/api/gyms/${gymSlug}/branches`
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setModalOpen(false)
      fetchBranches()
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!gymSlug || !confirm('هل أنت متأكد من إيقاف/حذف هذا الفرع؟')) return
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/branches/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      fetchBranches()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-cairo font-bold text-2xl">الفروع</h2>
          <p className="text-sm text-muted-c">إجمالي الفروع: {total}</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors">
          <Plus className="w-4 h-4" /> إضافة فرع
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm text-faint mb-1">عدد الفروع</p>
          <p className="text-xl font-bold text-strong">{total}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm text-faint mb-1">إجمالي الأعضاء</p>
          <p className="text-xl font-bold text-[#3B82F6]">{totalMembers}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm text-faint mb-1">إجمالي الكلاسات</p>
          <p className="text-xl font-bold text-[#22C55E]">{branches.reduce((s, b) => s + b._count.classes, 0)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم، العنوان، أو التليفون..." className="w-full bg-app border border-app rounded-xl py-3 pr-11 pl-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50" />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#22C55E]" />
          <p className="text-faint">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center text-faint">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-1">{search ? 'مفيش نتائج مطابقة' : 'مفيش فروع بعد'}</p>
          <p className="text-sm">{search ? 'جرّب كلمة بحث تانية' : 'ابدأ بإضافة أول فرع في جيمك'}</p>
          {!search && (
            <button onClick={openAdd} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors"><Plus className="w-4 h-4" /> إضافة أول فرع</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.id} className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-[#22C55E]/30 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#22C55E]/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-cairo font-bold text-strong truncate">{b.name}</h3>
                      {b.isMain && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-[#3B82F6]" /> رئيسي
                        </span>
                      )}
                      {!b.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold">متوقف</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:surface transition-colors text-faint hover:text-[#22C55E]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:surface transition-colors text-faint hover:text-[#EF4444]"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5 text-sm">
                {b.address && (
                  <div className="flex items-start gap-2 text-muted-c">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-faint" />
                    <span className="line-clamp-2">{b.address}</span>
                  </div>
                )}
                {b.phone && (
                  <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-muted-c hover:text-[#22C55E] transition-colors" dir="ltr">
                    <Phone className="w-4 h-4 shrink-0 text-faint" />
                    <span>{b.phone}</span>
                  </a>
                )}
                {!b.address && !b.phone && (
                  <p className="text-xs text-faint italic">مفيش بيانات اتصال</p>
                )}
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-app">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#3B82F6]">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-bold">{b._count.members}</span>
                  </div>
                  <p className="text-[10px] text-faint mt-0.5">أعضاء</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#A855F7]">
                    <UserCog className="w-3.5 h-3.5" />
                    <span className="font-bold">{b._count.profiles}</span>
                  </div>
                  <p className="text-[10px] text-faint mt-0.5">موظفين</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#22C55E]">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span className="font-bold">{b._count.classes}</span>
                  </div>
                  <p className="text-[10px] text-faint mt-0.5">كلاسات</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-app border border-app rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cairo font-bold text-lg">{editing ? 'تعديل الفرع' : 'إضافة فرع'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-faint hover:text-strong"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-faint mb-1">اسم الفرع *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: فرع المعادي، فرع مدينة نصر..." className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50" />
              </div>
              <div>
                <label className="block text-sm text-faint mb-1">العنوان</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="عنوان الفرع التفصيلي" rows={2} className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-faint mb-1">التليفون</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم تليفون الفرع" dir="ltr" className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 text-right" />
              </div>
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.isMain ? 'border-[#3B82F6]/50 bg-[#3B82F6]/5' : 'border-app hover:surface'}`}>
                <input type="checkbox" checked={form.isMain} onChange={(e) => setForm({ ...form, isMain: e.target.checked })} className="w-4 h-4 accent-[#3B82F6]" />
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${form.isMain ? 'fill-[#3B82F6] text-[#3B82F6]' : 'text-faint'}`} />
                  <div>
                    <p className="text-sm font-medium text-strong">الفرع الرئيسي</p>
                    <p className="text-xs text-faint">سيتم إلغاء التعيين من أي فرع رئيسي آخر</p>
                  </div>
                </div>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-50">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-app text-strong rounded-xl text-sm font-semibold hover:surface transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
