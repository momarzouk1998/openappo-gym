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
  advanced_reports: {
    key: 'advanced_reports' as AddonKey,
    name: 'التقارير المتقدمة',
    description: 'تقارير تفصيلية وتصدير Excel',
    price: 80,
    icon: 'bar-chart',
  },
  extra_branch: {
    key: 'extra_branch' as AddonKey,
    name: 'فرع إضافي',
    description: 'يُضاف لكل فرع إضافي فوق الأول',
    price: 150,
    icon: 'git-branch',
  },
} as const

export type AddonInfo = (typeof ADDONS)[keyof typeof ADDONS]
