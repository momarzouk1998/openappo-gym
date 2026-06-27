'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import {
  Dumbbell,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Building2,
  User,
  CreditCard,
} from 'lucide-react'
import { PLANS } from '@/lib/billing'
import { ADDONS } from '@/lib/addons'

type FormData = {
  // Gym
  gymName: string
  gymPhone: string
  city: string
  address: string
  // Owner
  ownerName: string
  ownerEmail: string
  ownerPassword: string
  ownerPhone: string
  // Plan
  plan: 'starter' | 'pro'
  addons: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    gymName: '',
    gymPhone: '',
    city: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    plan: 'starter',
    addons: [],
  })

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAddon = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.includes(key)
        ? prev.addons.filter((a) => a !== key)
        : [...prev.addons, key],
    }))
  }

  const validateStep = (): boolean => {
    setError('')
    if (step === 1) {
      if (!formData.gymName.trim()) {
        setError('اسم الجيم مطلوب')
        return false
      }
    }
    if (step === 2) {
      if (!formData.ownerName.trim()) {
        setError('اسم المالك مطلوب')
        return false
      }
      if (!formData.ownerEmail.trim()) {
        setError('البريد الإلكتروني مطلوب')
        return false
      }
      if (formData.ownerPassword.length < 6) {
        setError('كلمة المرور لازم 6 حروف على الأقل')
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ، حاول مرة أخرى')
        return
      }

      // Auto-login
      await signIn('credentials', {
        email: formData.ownerEmail,
        password: formData.ownerPassword,
        redirect: false,
      })

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى')
    } finally {
      // Always reset loading — button never gets stuck on any path
      // (matches login page pattern; was previously missing, causing the
      // spinner to hang permanently on the success path / router back-out)
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep()) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const totalAddonsPrice = formData.addons.reduce(
    (sum, key) => sum + (ADDONS[key as keyof typeof ADDONS]?.price ?? 0),
    0
  )
  const planPrice = PLANS[formData.plan].price
  const totalPrice = planPrice + totalAddonsPrice

  return (
    <div className="min-h-screen py-12 px-4 grid-bg relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#22C55E]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#22C55E] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="font-cairo font-bold text-2xl">
            Open<span className="text-[#22C55E]">Gym</span>
          </span>
        </Link>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-cairo transition-all ${
                  step >= s
                    ? 'bg-[#22C55E] text-white'
                    : 'surface text-faint border border-app'
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-px ${step > s ? 'bg-[#22C55E]' : 'bg-[#1F1F2E]'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Step 1: Gym Info */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="font-cairo font-bold text-xl">بيانات الجيم</h2>
                  <p className="text-sm text-muted-c">
                    معلومات أساسية عن جيمك
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-soft">
                    اسم الجيم *
                  </label>
                  <input
                    type="text"
                    value={formData.gymName}
                    onChange={(e) => updateField('gymName', e.target.value)}
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                    placeholder="مثال: جيم القوة"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-soft">
                      رقم تليفون الجيم
                    </label>
                    <input
                      type="tel"
                      value={formData.gymPhone}
                      onChange={(e) => updateField('gymPhone', e.target.value)}
                      dir="ltr"
                      className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                      placeholder="01012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-soft">
                      المدينة
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                      placeholder="القاهرة"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-soft">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                    placeholder="شارع التحرير، وسط البلد"
                  />
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full mt-8 flex items-center justify-center gap-2 py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Owner Info */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="font-cairo font-bold text-xl">بيانات المالك</h2>
                  <p className="text-sm text-muted-c">
                    حسابك للدخول للوحة التحكم
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-soft">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                    placeholder="أحمد محمد"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-soft">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => updateField('ownerEmail', e.target.value)}
                      dir="ltr"
                      className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-soft">
                      تليفون المالك
                    </label>
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => updateField('ownerPhone', e.target.value)}
                      dir="ltr"
                      className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                      placeholder="01012345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-soft">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    value={formData.ownerPassword}
                    onChange={(e) => updateField('ownerPassword', e.target.value)}
                    dir="ltr"
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-white placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                    placeholder="6 حروف على الأقل"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={prevStep}
                  className="px-6 py-3.5 border border-app text-white rounded-xl font-semibold hover:surface transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
                >
                  التالي
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="font-cairo font-bold text-xl">اختر الباقة</h2>
                  <p className="text-sm text-muted-c">
                    تبدأ تجربة مجانية 14 يوم
                  </p>
                </div>
              </div>

              {/* Plan selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.values(PLANS).map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => updateField('plan', plan.key)}
                    className={`p-5 rounded-xl border-2 text-right transition-all ${
                      formData.plan === plan.key
                        ? 'border-[#22C55E] bg-[#22C55E]/5'
                        : 'border-app hover:border-[#22C55E]/30'
                    }`}
                  >
                    <div className="font-cairo font-bold text-lg mb-1">
                      {plan.name}
                    </div>
                    <div className="text-2xl font-bold text-[#22C55E]">
                      {plan.price}
                      <span className="text-sm text-faint"> ج/شهر</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Addons */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-soft">
                  إضافات اختيارية
                </h3>
                <div className="space-y-2">
                  {Object.values(ADDONS).map((addon) => (
                    <label
                      key={addon.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.addons.includes(addon.key)
                          ? 'border-[#22C55E]/40 bg-[#22C55E]/5'
                          : 'border-app hover:border-[#22C55E]/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.addons.includes(addon.key)}
                        onChange={() => toggleAddon(addon.key)}
                        className="w-5 h-5 rounded accent-[#22C55E]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{addon.name}</div>
                        <div className="text-xs text-muted-c">
                          {addon.description}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#22C55E]">
                        +{addon.price} ج
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="p-4 surface rounded-xl border border-app mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-c">
                    باقة {PLANS[formData.plan].name}
                  </span>
                  <span>{planPrice} ج</span>
                </div>
                {formData.addons.map((key) => (
                  <div
                    key={key}
                    className="flex justify-between text-sm mb-2"
                  >
                    <span className="text-muted-c">
                      {ADDONS[key as keyof typeof ADDONS].name}
                    </span>
                    <span>{ADDONS[key as keyof typeof ADDONS].price} ج</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-app flex justify-between font-bold">
                  <span>الإجمالي شهرياً</span>
                  <span className="text-[#22C55E]">{totalPrice} ج</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="px-6 py-3.5 border border-app text-white rounded-xl font-semibold hover:surface transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'ابدأ التجربة المجانية'
                  )}
                </button>
              </div>

              <p className="text-center mt-4 text-xs text-faint">
                التجربة المجانية 14 يوم، الدفع بعدها عبر انستاباي / فودافون كاش
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-faint">
          عندك حساب بالفعل؟{' '}
          <Link
            href="/login"
            className="text-[#22C55E] font-medium hover:underline"
          >
            سجّل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
