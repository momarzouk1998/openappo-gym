import { AddonKey } from '@prisma/client'

export const ADDONS = {
  expenses: {
    key: 'expenses' as AddonKey,
    name: 'المصروفات والخزنة',
    description: 'تتبع المصروفات وإدارة الخزنة',
    price: 100,
    icon: 'wallet',
  },
  staff: {
    key: 'staff' as AddonKey,
    name: 'الموظفون والصلاحيات',
    description: 'إضافة موظفين بصلاحيات مختلفة',
    price: 100,
    icon: 'users',
  },
  trainers: {
    key: 'trainers' as AddonKey,
    name: 'المدربون',
    description: 'إدارة المدربين وربطهم بالأعضاء',
    price: 100,
    icon: 'dumbbell',
  },
  classes: {
    key: 'classes' as AddonKey,
    name: 'الكلاسات والحجوزات',
    description: 'جدول الكلاسات وحجوزات الأعضاء',
    price: 150,
    icon: 'calendar',
  },
  branches: {
    key: 'branches' as AddonKey,
    name: 'إدارة الفروع',
    description: 'إدارة كل فروع جيمك من مكان واحد — أضف فروع جديدة وتابع كل فرع على حدة',
    price: 150,
    icon: 'building',
  },
  advanced_reports: {
    key: 'advanced_reports' as AddonKey,
    name: 'التقارير المتقدمة',
    description: 'تقارير تفصيلية وتصدير Excel',
    price: 80,
    icon: 'bar-chart',
  },
  // NOTE: 'extra_branch' enum value is kept in the DB schema for backward
  // compatibility, but it is intentionally NOT exposed in ADDONS — the
  // 'branches' addon above covers all multi-branch needs with a single price.
} as const

export type AddonInfo = (typeof ADDONS)[keyof typeof ADDONS]
