import Link from 'next/link'
import { Users, CreditCard, Wallet, AlertCircle, Plus, TrendingUp } from 'lucide-react'

export default function DashboardHome() {
  // Placeholder stats — will be replaced with real data after auth integration
  const stats = [
    {
      label: 'إجمالي الأعضاء',
      value: '0',
      change: '+0 هذا الشهر',
      icon: Users,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10',
    },
    {
      label: 'الاشتراكات الفعّالة',
      value: '0',
      change: 'منتهية: 0',
      icon: CreditCard,
      color: 'text-[#4ADE80]',
      bg: 'bg-[#4ADE80]/10',
    },
    {
      label: 'إيرادات الشهر',
      value: '0 ج',
      change: '+0% عن الشهر الماضي',
      icon: Wallet,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10',
    },
    {
      label: 'تنتهي قريباً',
      value: '0',
      change: 'خلال 7 أيام',
      icon: AlertCircle,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-cairo font-bold text-2xl mb-1">
            أهلاً بك في لوحة التحكم 👋
          </h2>
          <p className="text-[#94A3B8]">إليك ملخص جيمك اليوم</p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة عضو
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-5 rounded-2xl hover:border-[#22C55E]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-3xl font-bold font-cairo mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[#94A3B8]">{stat.label}</div>
            <div className="text-xs text-[#64748B] mt-2">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Empty state for chart + list */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="font-cairo font-bold text-lg mb-1">إيرادات آخر 6 شهور</h3>
          <p className="text-sm text-[#64748B] mb-6">إجمالي المدفوعات الشهرية</p>
          <div className="h-64 flex items-center justify-center text-[#64748B]">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>الرسم البياني سيظهر هنا بعد إضافة المدفوعات</p>
            </div>
          </div>
        </div>

        {/* Expiring list */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-cairo font-bold text-lg mb-1">تنتهي قريباً</h3>
          <p className="text-sm text-[#64748B] mb-6">اشتراكات خلال 7 أيام</p>
          <div className="space-y-3">
            <div className="text-center py-8 text-[#64748B]">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">مفيش اشتراكات تنتهي قريباً</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
