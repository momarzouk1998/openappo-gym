import { ADDONS } from './addons'
import { AddonKey } from '@prisma/client'

interface BillBreakdown {
  base: number
  addonsTotal: number
  total: number
  addonsDetail: { key: string; name: string; price: number }[]
}

export function calculateGymBill(
  basePlanPrice: number,
  addons: AddonKey[]
): BillBreakdown {
  const base = basePlanPrice

  const addonsTotal = addons.reduce((sum, addonKey) => {
    return sum + (ADDONS[addonKey as keyof typeof ADDONS]?.price ?? 0)
  }, 0)

  return {
    base,
    addonsTotal,
    total: base + addonsTotal,
    addonsDetail: addons.map((key) => ({
      key,
      name: ADDONS[key as keyof typeof ADDONS].name,
      price: ADDONS[key as keyof typeof ADDONS].price,
    })),
  }
}

export function calculateAddonProration(
  addonPrice: number,
  nextBillingDate: Date
): number {
  const today = new Date()
  const daysRemaining = Math.max(
    1,
    Math.ceil(
      (nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  )
  const daysInMonth = 30
  const prorated = Math.ceil((addonPrice / daysInMonth) * daysRemaining)
  return prorated
}

export const PLANS = {
  starter: {
    key: 'starter',
    name: 'Starter',
    price: 299,
    features: [
      'أعضاء غير محدودين',
      'اشتراكات ومدفوعات',
      'تقارير أساسية',
      'فرع واحد',
      'دعم فني',
    ],
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    price: 599,
    popular: true,
    features: [
      'كل مميزات Starter',
      'فروع متعددة',
      'موظفين وصلاحيات',
      'مدربين',
      'تقارير متقدمة',
      'أولوية الدعم',
    ],
  },
} as const
