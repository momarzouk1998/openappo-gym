# Trial-First Onboarding — Design Spec

**Date:** 2026-06-28
**Status:** Approved

## Problem

New gym owners registering on OpenGym are confronted with plan selection (Starter/Pro) and addon choices during registration. They don't understand what these features do, can't evaluate pricing before trying the product, and the price shock creates friction. The signup flow is longer than necessary.

## Solution

Replace the 3-step registration wizard with a streamlined 2-step flow. Remove all pricing/plan/addon selection from registration. Default to Starter plan with all addons enabled during the 14-day trial. Add a dedicated `/dashboard/plans` page where users learn about features and choose their plan AFTER experiencing the product.

---

## Changes

### 1. Registration Page — 2 Steps Only

**File:** `app/(auth)/register/page.tsx`

#### Step 1: Gym Info
| Field | Required | Notes |
|---|---|---|
| Gym name (اسم الجيم) | Yes | — |
| City (المدينة) | No | Optional |
| ~~Gym phone~~ | **Removed** | — |
| ~~Address~~ | **Removed** | City is sufficient for now |

#### Step 2: Owner Info + Submit
| Field | Required | Notes |
|---|---|---|
| Full name (الاسم الكامل) | Yes | — |
| Email (البريد الإلكتروني) | Yes | Login credential |
| Owner phone (تليفون المالك) | **Yes** | Changed from optional to required — needed for communication |
| Password (كلمة المرور) | Yes | Min 6 chars |

**After Step 2:** Submit button labeled "ابدأ تجربتك المجانية" with subtitle "🎁 تجربة مجانية 14 يوم — استمتع بكل المميزات بدون دفع".

**Stepper:** Remove the 3rd step indicator. Show only 2 steps.

#### Backend Changes
**File:** `app/api/auth/register/route.ts`
- Default `plan` to `'starter'` if not provided (or ignore the field entirely)
- Default `addons` to ALL addon keys: `['expenses', 'staff', 'trainers', 'classes', 'branches', 'advanced_reports', 'extra_branch']`
- Remove `gymPhone` from accepted fields (stop storing it)
- `ownerPhone` is now required — validate its presence
- `city` and `address` remain optional (city stays, address removed from frontend)

### 2. New Page: `/dashboard/plans` — "الباقات والأسعار"

**File:** `app/(dashboard)/dashboard/plans/page.tsx` (new)

A page inside the dashboard where users can:
1. **Understand what each plan offers** — clear feature comparison table
2. **Understand each addon** — what it does, with description and price
3. **Select their plan and addons** — interactive selection with live price summary
4. **See trial status** — if in trial, show a banner: "أنت في التجربة المجانية — كل المميزات مفتوحة دلوقتي"

#### Plan Display
| Plan | Price | Features |
|---|---|---|
| **Starter** | 299 ج/شهر | إدارة الأعضاء، الاشتراكات، المدفوعات، التقارير الأساسية |
| **Pro** | 599 ج/شهر | كل مميزات Starter + التقارير المتقدمة، إدارة الفروع، إدارة الموظفين والصلاحيات |

#### Addon Display (7 addons)
Each addon shows: name, clear description explaining what it does, price.
- المصروفات والخزنة (100 ج) — تتبع مصروفات الجيم اليومية والشهرية
- الموظفون والصلاحيات (100 ج) — إضافة موظفين وتحديد صلاحيات كل واحد
- المدربون (100 ج) — إدارة بيانات المدربين وجدولهم
- الكلاسات والحجوزات (150 ج) — إنشاء كلاسات وحجز أماكن للأعضاء
- إدارة الفروع (150 ج) — إدري الفروع كلها من مكان واحد
- التقارير المتقدمة (80 ج) — تقارير تفصيلية وإحصائيات متقدمة
- فرع إضافي (150 ج) — فرع إضافي مع باقة Starter

#### Selection & Submit
- Click to select plan (Starter/Pro)
- Checkbox toggles for addons
- Live price summary: base + addons = total
- Submit button: "تأكيد الاشتراك"

### 3. Sidebar Update

**File:** `components/dashboard/Sidebar.tsx`

Add a new menu item before "الإعدادات" (Settings):
- Icon: CreditCard or Crown
- Label: "الباقات والأسعار"
- Route: `/dashboard/plans`

### 4. Trial Banner Update

**File:** `components/dashboard/TrialBanner.tsx`

Change the CTA button:
- **Current:** "اشترك الآن" → links to `/dashboard/settings`
- **New:** "شوف الباقات والأسعار" → links to `/dashboard/plans`

### 5. Data Flow

```
Registration:
  Step 1 (Gym Info) → Step 2 (Owner Info) → POST /api/auth/register
  Backend: plan=starter, addons=[ALL 7 ADDONS], status=trial, trialEndsAt=now+14d
  Auto-login → redirect to /dashboard

During Trial:
  Dashboard → TrialBanner shows days remaining
  User clicks "شوف الباقات والأسعار" → /dashboard/plans
  /dashboard/plans → Shows plans & addons with explanations
  User can select plan + addons (stored in DB for later)

After Trial Ends:
  User must have selected plan/addons
  Payment via Instapay/Vodafone Cash (existing offline flow)
```

### 6. What Does NOT Change
- Landing page pricing section stays as-is (marketing)
- `/dashboard/settings` stays as-is (gym info editing, gym plan management for members)
- Backend Gym PATCH API stays as-is
- Trial expiry logic stays as-is (no automatic suspension — future work)
- Payment flow stays offline
