# Trial-First Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify registration to 2 steps (no pricing), default to Starter plan with all addons during 14-day trial, and add a `/dashboard/plans` page for plan/addon education and selection.

**Architecture:** The registration wizard is reduced from 3 steps to 2. The backend always creates the gym with `plan=starter` and all addons enabled. A new dashboard page at `/dashboard/plans` replaces the plan selection that was in registration. The sidebar gains a new nav item. The TrialBanner links to the new plans page.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Lucide React icons, Motion (Framer Motion), Zustand store

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `app/(auth)/register/page.tsx` | **Modify** | 2-step registration wizard (remove step 3) |
| `app/api/auth/register/route.ts` | **Modify** | Default plan/addons, require ownerPhone, remove gymPhone |
| `app/(dashboard)/dashboard/plans/page.tsx` | **Create** | Plans & addons education + selection page |
| `components/dashboard/Sidebar.tsx` | **Modify** | Add "الباقات والأسعار" nav item |
| `components/dashboard/TrialBanner.tsx` | **Modify** | Change CTA link from settings to plans page |

---

### Task 1: Update Registration API Backend

**Files:**
- Modify: `app/api/auth/register/route.ts`

- [ ] **Step 1: Update the register API**

Changes to `app/api/auth/register/route.ts`:

1. Add `ownerPhone` to required validation
2. Stop accepting `gymPhone` (ignore or remove from destructuring)
3. Default `plan` to `'starter'` (ignore client-sent value)
4. Default `addons` to ALL addon keys: `['expenses', 'staff', 'trainers', 'classes', 'branches', 'advanced_reports', 'extra_branch']`

Replace the full file content:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'
import type { AddonKey } from '@prisma/client'

// All addons unlocked during 14-day trial
const TRIAL_ADDONS: AddonKey[] = [
  'expenses',
  'staff',
  'trainers',
  'classes',
  'branches',
  'advanced_reports',
  'extra_branch',
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      gymName,
      city,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
    } = body

    // Validation — required fields
    if (!gymName || !ownerName || !ownerEmail || !ownerPassword || !ownerPhone) {
      return NextResponse.json(
        { error: 'بيانات ناقصة. املأ الحقول المطلوبة.' },
        { status: 400 }
      )
    }

    if (ownerPassword.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور لازم 6 حروف على الأقل' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجّل بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 12)

    // Generate unique slug
    let slug = slugify(gymName)
    const existingGym = await prisma.gym.findUnique({ where: { slug } })
    if (existingGym) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Default: starter plan with all addons for trial
    const basePlanPrice = 299

    // Trial period: 14 days from now
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // Create gym + user + profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create gym
      const gym = await tx.gym.create({
        data: {
          name: gymName,
          slug,
          city: city || null,
          ownerName,
          ownerPhone,
          ownerEmail,
          status: 'trial',
          trialEndsAt,
          basePlanPrice,
          addons: TRIAL_ADDONS,
        },
      })

      // 2. Create main branch
      await tx.branch.create({
        data: {
          gymId: gym.id,
          name: 'الفرع الرئيسي',
          isMain: true,
        },
      })

      // 3. Create user
      const user = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
        },
      })

      // 4. Create profile (gym_owner role)
      await tx.profile.create({
        data: {
          id: user.id,
          gymId: gym.id,
          role: 'gym_owner',
          fullName: ownerName,
          phone: ownerPhone,
          isActive: true,
        },
      })

      // 5. Create default subscription plan
      await tx.gymPlan.create({
        data: {
          gymId: gym.id,
          name: 'شهري',
          duration: 30,
          price: 300,
        },
      })

      await tx.gymPlan.create({
        data: {
          gymId: gym.id,
          name: 'ثلاثة أشهر',
          duration: 90,
          price: 800,
        },
      })

      return { gym, user }
    })

    return NextResponse.json({
      success: true,
      gymId: result.gym.id,
      userId: result.user.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "D:/OPEN APPS/GYM Management/opengym" && npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
cd "D:/OPEN APPS/GYM Management/opengym"
git add app/api/auth/register/route.ts
git commit -m "feat: simplify registration API — default starter plan, all addons, require ownerPhone"
```

---

### Task 2: Update Registration Page (2-step wizard)

**Files:**
- Modify: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Rewrite the registration page**

Replace the full file content of `app/(auth)/register/page.tsx`:

```typescript
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
  Gift,
} from 'lucide-react'

type FormData = {
  // Gym
  gymName: string
  city: string
  // Owner
  ownerName: string
  ownerEmail: string
  ownerPassword: string
  ownerPhone: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    gymName: '',
    city: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
  })

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      if (!formData.ownerPhone.trim()) {
        setError('رقم التليفون مطلوب')
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
    if (!validateStep()) return
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
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep()) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

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

        {/* Stepper — 2 steps only */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
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
              {s < 2 && (
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
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                    placeholder="مثال: جيم القوة"
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
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
                    placeholder="القاهرة"
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

          {/* Step 2: Owner Info + Submit */}
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
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20"
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
                      className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-soft">
                      التليفون *
                    </label>
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => updateField('ownerPhone', e.target.value)}
                      dir="ltr"
                      className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
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
                    className="w-full bg-app border border-app rounded-xl py-3 px-4 text-strong placeholder:text-faint focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20 text-left"
                    placeholder="6 حروف على الأقل"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={prevStep}
                  className="px-6 py-3.5 border border-app text-strong rounded-xl font-semibold hover:surface transition-all"
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
                    <>
                      <Gift className="w-5 h-5" />
                      ابدأ تجربتك المجانية
                    </>
                  )}
                </button>
              </div>

              <p className="text-center mt-4 text-xs text-faint">
                🎁 تجربة مجانية 14 يوم — استمتع بكل المميزات بدون دفع
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
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "D:/OPEN APPS/GYM Management/opengym" && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd "D:/OPEN APPS/GYM Management/opengym"
git add app/(auth)/register/page.tsx
git commit -m "feat: simplify registration to 2 steps — remove plan/addon selection"
```

---

### Task 3: Create `/dashboard/plans` Page

**Files:**
- Create: `app/(dashboard)/dashboard/plans/page.tsx`

This page shows plans and addons with clear descriptions, lets users select their preferred plan and addons, and saves the selection to the gym record.

- [ ] **Step 1: Create the plans page**

Create file `app/(dashboard)/dashboard/plans/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useGymStore } from '@/store/gym-store'
import { PLANS } from '@/lib/billing'
import { ADDONS } from '@/lib/addons'
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  CreditCard,
  Wallet,
  UserCog,
  Dumbbell,
  Calendar,
  Building2,
  BarChart3,
  GitBranch,
  CheckCircle2,
} from 'lucide-react'

const ADDON_ICONS: Record<string, any> = {
  expenses: Wallet,
  staff: UserCog,
  trainers: Dumbbell,
  classes: Calendar,
  branches: Building2,
  advanced_reports: BarChart3,
  extra_branch: GitBranch,
}

export default function PlansPage() {
  const { gym } = useGymStore()
  const gymSlug = gym?.slug

  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isTrial = gym?.status === 'trial'

  // Sync from gym data on load
  useEffect(() => {
    if (!gym) return
    const planKey = gym.basePlanPrice >= 599 ? 'pro' : 'starter'
    setSelectedPlan(planKey)
    setSelectedAddons(gym.addons || [])
    setLoading(false)
  }, [gym])

  const toggleAddon = (key: string) => {
    setSelectedAddons((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    )
  }

  const handleSave = async () => {
    if (!gymSlug) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const plan = PLANS[selectedPlan]
      const res = await fetch(`/api/gyms/${gymSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePlanPrice: plan.price,
          addons: selectedAddons,
        }),
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

  const addonsTotal = selectedAddons.reduce(
    (sum, key) => sum + (ADDONS[key as keyof typeof ADDONS]?.price ?? 0),
    0
  )
  const planPrice = PLANS[selectedPlan].price
  const totalPrice = planPrice + addonsTotal

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-cairo font-bold text-2xl">الباقات والأسعار</h2>
        <p className="text-sm text-muted-c mt-1">
          اختار الباقة والإضافات المناسبة لجيمك
        </p>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
          <div className="w-9 h-9 rounded-lg bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-sm font-medium text-strong">
              أنت في التجربة المجانية — كل المميزات مفتوحة دلوقتي
            </p>
            <p className="text-xs text-faint">
              جرّب كل حاجة واختار الباقة المناسبة لك قبل ما التجربة تنتهي
            </p>
          </div>
        </div>
      )}

      {/* Plans comparison */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-[#22C55E]" />
          <h3 className="font-cairo font-bold text-lg">الباقات</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(PLANS).map((plan) => {
            const isSelected = selectedPlan === plan.key
            const isPopular = 'popular' in plan && plan.popular
            return (
              <button
                key={plan.key}
                onClick={() => setSelectedPlan(plan.key as 'starter' | 'pro')}
                className={`relative p-6 rounded-2xl border-2 text-right transition-all ${
                  isSelected
                    ? 'border-[#22C55E] bg-[#22C55E]/5'
                    : 'border-app hover:border-[#22C55E]/30'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-[#22C55E] text-white text-xs font-bold rounded-full">
                    الأكثر شعبية
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="font-cairo font-bold text-xl">{plan.name}</div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-[#22C55E] mb-4">
                  {plan.price}
                  <span className="text-sm text-faint font-normal"> ج/شهر</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-soft">
                      <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </div>

      {/* Addons */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-[#22C55E]" />
          <h3 className="font-cairo font-bold text-lg">الإضافات</h3>
        </div>

        <p className="text-sm text-muted-c mb-4">
          اختار الإضافات اللي محتاجها زيادة عن الباقة الأساسية
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {Object.values(ADDONS).map((addon) => {
            const isActive = selectedAddons.includes(addon.key)
            const IconComponent = ADDON_ICONS[addon.key] || CreditCard
            return (
              <button
                key={addon.key}
                onClick={() => toggleAddon(addon.key)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-right transition-all ${
                  isActive
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/5'
                    : 'border-app hover:border-[#22C55E]/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-[#22C55E] border-[#22C55E]'
                      : 'border-app'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4 text-[#22C55E]" />
                    <span className="font-medium text-sm">{addon.name}</span>
                  </div>
                  <p className="text-xs text-muted-c mb-2">{addon.description}</p>
                  <span className="text-sm font-bold text-[#22C55E]">
                    +{addon.price} ج/شهر
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price summary */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-[#22C55E]" />
          <h3 className="font-cairo font-bold text-lg">ملخص الاشتراك</h3>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-c">باقة {PLANS[selectedPlan].name}</span>
          <span>{planPrice} ج</span>
        </div>
        {selectedAddons.map((key) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-muted-c">
              {ADDONS[key as keyof typeof ADDONS].name}
            </span>
            <span>{ADDONS[key as keyof typeof ADDONS].price} ج</span>
          </div>
        ))}
        {selectedAddons.length === 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-c">إضافات</span>
            <span className="text-faint">مفيش إضافات</span>
          </div>
        )}
        <div className="pt-3 border-t border-app flex justify-between font-bold text-lg">
          <span>الإجمالي شهرياً</span>
          <span className="text-[#22C55E]">{totalPrice} ج</span>
        </div>
      </div>

      {/* Save status */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          تم حفظ اختيارك بنجاح
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-[#22C55E] text-white rounded-xl font-bold text-lg hover:bg-[#16A34A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          'تأكيد الاشتراك'
        )}
      </button>

      {/* Payment note */}
      <div className="p-4 surface rounded-xl border border-app text-center">
        <p className="text-xs text-muted-c">
          للحصول على الباقة، تواصل معنا على:{' '}
          <span className="font-bold text-[#22C55E]" dir="ltr">
            01558282760
          </span>{' '}
          (انستاباي / فودافون كاش)
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "D:/OPEN APPS/GYM Management/opengym" && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd "D:/OPEN APPS/GYM Management/opengym"
git add app/(dashboard)/dashboard/plans/page.tsx
git commit -m "feat: add /dashboard/plans page with plan and addon education + selection"
```

---

### Task 4: Update Sidebar — Add Plans Nav Item

**Files:**
- Modify: `components/dashboard/Sidebar.tsx`

- [ ] **Step 1: Add the plans nav item to sidebar**

In `components/dashboard/Sidebar.tsx`, add `Crown` to the lucide-react imports (line 7-23 area).

Then add the plans nav item BEFORE the Settings link. Insert this block right before the `{/* Settings */}` comment (around line 210):

```tsx
          {/* Plans & Pricing */}
          <Link
            href="/dashboard/plans"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/plans')
                ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                : 'text-muted-c hover:surface hover:text-strong'
            }`}
          >
            <Crown className="w-5 h-5" />
            <span className="text-sm font-medium">الباقات والأسعار</span>
          </Link>
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "D:/OPEN APPS/GYM Management/opengym" && npx next build`

- [ ] **Step 3: Commit**

```bash
cd "D:/OPEN APPS/GYM Management/opengym"
git add components/dashboard/Sidebar.tsx
git commit -m "feat: add Plans & Pricing nav item to sidebar"
```

---

### Task 5: Update TrialBanner — Change CTA Link

**Files:**
- Modify: `components/dashboard/TrialBanner.tsx`

- [ ] **Step 1: Change the CTA link**

In `components/dashboard/TrialBanner.tsx`, change the `Link` href from `/dashboard/settings` to `/dashboard/plans` and change the label from `اشترك الآن` to `شوف الباقات والأسعار`.

Replace:
```tsx
              <Link
                href="/dashboard/settings"
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isUrgent
                    ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                    : 'bg-[#22C55E] text-white hover:bg-[#16A34A]'
                }`}
              >
                اشترك الآن
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
```

With:
```tsx
              <Link
                href="/dashboard/plans"
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isUrgent
                    ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                    : 'bg-[#22C55E] text-white hover:bg-[#16A34A]'
                }`}
              >
                شوف الباقات والأسعار
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
```

- [ ] **Step 2: Commit**

```bash
cd "D:/OPEN APPS/GYM Management/opengym"
git add components/dashboard/TrialBanner.tsx
git commit -m "feat: update TrialBanner CTA to link to plans page"
```

---

### Task 6: Final Build & Smoke Test

- [ ] **Step 1: Run full build**

Run: `cd "D:/OPEN APPS/GYM Management/opengym" && npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run dev server and test**

Run: `cd "D:/OPEN APPS/GYM Management/opengym" && npm run dev`

Manual test checklist:
1. Go to `/register` — should show 2 steps only (no plan/addon step)
2. Step 1: gym name + city only (no phone, no address)
3. Step 2: owner name + email + phone (required) + password
4. Submit creates account with Starter plan + all addons
5. After login, TrialBanner shows with "شوف الباقات والأسعار" link
6. Sidebar shows "الباقات والأسعار" before "الإعدادات"
7. `/dashboard/plans` shows plans comparison + addon descriptions + selection
8. Saving plan selection works (PATCH to gym)
