'use client'

import { useState, useEffect } from 'react'
import { useGymStore } from '@/store/gym-store'
import { formatCurrency } from '@/lib/utils'
import {
  Building2,
  Wallet,
  CreditCard,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react'

interface GymDetails {
  id: string
  name: string
  slug: string
  phone: string | null
  city: string | null
  address: string | null
  status: string
  basePlanPrice: number
  billingCycle: string
  createdAt: string
}

interface GymPlan {
  id: string
  name: string
  duration: number
  price: number
}

const planLabels: Record<string, number> = {
  monthly: 299,
  pro: 599,
}

export default function SettingsPage() {
  const { gym } = useGymStore()
  const gymSlug = gym?.slug

  const [gymData, setGymData] = useState<GymDetails | null>(null)
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
  })

  // Plan form
  const [planForm, setPlanForm] = useState({ name: '', duration: '30', price: '300' })
  const [planSaving, setPlanSaving] = useState(false)

  useEffect(() => {
    if (!gymSlug) return
    fetch(`/api/gyms/${gymSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setGymData(data.gym)
        setPlans(data.plans)
        setForm({
          name: data.gym.name || '',
          phone: data.gym.phone || '',
          city: data.gym.city || '',
          address: data.gym.address || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [gymSlug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymSlug) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch(`/api/gyms/${gymSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymSlug) return
    setPlanSaving(true)
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name,
          duration: parseInt(planForm.duration),
          price: parseFloat(planForm.price),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل إضافة الخطة')
      setPlans([...plans, data.plan])
      setPlanForm({ name: '', duration: '30', price: '300' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setPlanSaving(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!gymSlug) return
    if (!confirm('متأكد من حذف هذه الخطة؟')) return
    try {
      const res = await fetch(`/api/gyms/${gymSlug}/plans/${planId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('فشل الحذف')
      setPlans(plans.filter((p) => p.id !== planId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  const inputClass =
    'w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20'

  const planName = gymData?.basePlanPrice && gymData.basePlanPrice >= 599 ? 'Pro' : 'Starter'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الإعدادات</h2>
        <p className="text-sm text-[#94A3B8]">إدارة بيانات جيمك وحسابك</p>
      </div>

      {/* Gym Info */}
      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">بيانات الجيم</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            تم الحفظ بنجاح
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">اسم الجيم</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">التليفون</label>
            <input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`${inputClass} text-left`}
              placeholder="01012345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">المدينة</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass}
              placeholder="القاهرة"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">العنوان</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass}
            placeholder="العنوان التفصيلي"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ التغييرات'
          )}
        </button>
      </form>

      {/* Subscription Plans */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">خطط الاشتراك</h3>
        </div>

        {/* Existing plans */}
        <div className="space-y-2">
          {plans.length === 0 ? (
            <p className="text-sm text-[#64748B]">مفيش خطط بعد</p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-3 bg-[#111118] rounded-xl"
              >
                <div>
                  <div className="font-medium text-sm">{plan.name}</div>
                  <div className="text-xs text-[#64748B]">
                    {plan.duration} يوم — {formatCurrency(plan.price)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add plan form */}
        <form onSubmit={handleAddPlan} className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1F1F2E]">
          <input
            type="text"
            required
            placeholder="اسم الخطة"
            value={planForm.name}
            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
            className={`${inputClass} py-2.5 text-sm`}
          />
          <input
            type="number"
            required
            min="1"
            dir="ltr"
            placeholder="المدة (يوم)"
            value={planForm.duration}
            onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
            className={`${inputClass} py-2.5 text-sm text-left`}
          />
          <input
            type="number"
            required
            min="0"
            dir="ltr"
            placeholder="السعر"
            value={planForm.price}
            onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
            className={`${inputClass} py-2.5 text-sm text-left`}
          />
          <button
            type="submit"
            disabled={planSaving}
            className="bg-[#22C55E]/10 text-[#22C55E] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#22C55E]/20 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {planSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            إضافة
          </button>
        </form>
      </div>

      {/* Billing */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">الباقة والدفع</h3>
        </div>

        <div className="p-4 bg-[#111118] rounded-xl border border-[#1F1F2E]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8]">الباقة الحالية</span>
            <span className="font-bold text-[#22C55E]">{planName}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8]">السعر الشهري</span>
            <span className="font-bold">{formatCurrency(gymData?.basePlanPrice ?? 299)}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8]">الحالة</span>
            <span className="font-bold text-[#F59E0B]">
              {gymData?.status === 'trial' ? 'فترة تجريبية' : gymData?.status === 'active' ? 'فعّال' : gymData?.status}
            </span>
          </div>
          <div className="pt-4 border-t border-[#1F1F2E]">
            <p className="text-sm text-[#94A3B8] mb-2">للتجديد والدفع:</p>
            <p className="text-sm">
              انستاباي / فودافون كاش:{' '}
              <span className="font-bold text-[#22C55E]" dir="ltr">
                01558282760
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
