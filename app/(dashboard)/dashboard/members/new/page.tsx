'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, User, CreditCard } from 'lucide-react'

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: implement member creation
    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard/members')
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">إضافة عضو جديد</h2>
        <p className="text-sm text-[#94A3B8]">
          أدخل بيانات العضو واشتراكه
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#22C55E]" />
            </div>
            <h3 className="font-cairo font-bold text-lg">البيانات الأساسية</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                الاسم الكامل *
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                placeholder="أحمد محمد"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                رقم التليفون *
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                placeholder="01012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                الجنس
              </label>
              <select className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50">
                <option value="">اختر...</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                dir="ltr"
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 text-left"
              />
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#22C55E]" />
            </div>
            <h3 className="font-cairo font-bold text-lg">الاشتراك</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                نوع الاشتراك *
              </label>
              <select className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50">
                <option value="">اختر الخطة...</option>
                <option value="monthly">شهري - 300 ج</option>
                <option value="quarterly">ثلاثة أشهر - 800 ج</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                تاريخ البداية *
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                dir="ltr"
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 text-left"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                السعر الأصلي
              </label>
              <input
                type="number"
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50"
                placeholder="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                طريقة الدفع *
              </label>
              <select className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50">
                <option value="cash">كاش</option>
                <option value="instapay">انستاباي</option>
                <option value="vodafone_cash">فودافون كاش</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 border border-[#1F1F2E] text-white rounded-xl font-semibold hover:bg-[#111118] transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ العضو'}
          </button>
        </div>
      </form>
    </div>
  )
}
