import Link from 'next/link'
import {
  Building2,
  CheckCircle2,
  Clock,
  PauseCircle,
  Wallet,
  Users,
  TrendingUp,
} from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      label: 'إجمالي الجيمات',
      value: '0',
      icon: Building2,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10',
    },
    {
      label: 'الجيمات الفعّالة',
      value: '0',
      icon: CheckCircle2,
      color: 'text-[#4ADE80]',
      bg: 'bg-[#4ADE80]/10',
    },
    {
      label: 'في التجربة',
      value: '0',
      icon: Clock,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    },
    {
      label: 'معلّقة',
      value: '0',
      icon: PauseCircle,
      color: 'text-[#EF4444]',
      bg: 'bg-[#EF4444]/10',
    },
  ]

  const revenueStats = [
    {
      label: 'إيرادات هذا الشهر',
      value: '0 ج',
      icon: Wallet,
    },
    {
      label: 'الإيرادات المتوقعة',
      value: '0 ج',
      icon: TrendingUp,
    },
    {
      label: 'إجمالي الأعضاء (كل الجيمات)',
      value: '0',
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl mb-1">نظرة عامة</h2>
        <p className="text-[#94A3B8]">إحصائيات المنصة والجيمات</p>
      </div>

      {/* Gym stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div
              className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold font-cairo mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[#94A3B8]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {revenueStats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm text-[#94A3B8]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold font-cairo">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Gyms table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1F1F2E] flex items-center justify-between">
          <h3 className="font-cairo font-bold text-lg">الجيمات</h3>
          <Link
            href="/admin/gyms"
            className="text-sm text-[#22C55E] hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">الجيم</th>
                <th className="p-4 font-medium">المالك</th>
                <th className="p-4 font-medium">الباقة</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">الدفع القادم</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="p-12 text-center text-[#64748B]">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>مفيش جيمات مسجّلة بعد</p>
                  <p className="text-xs mt-1">
                    لما يسجّل أصحاب الجيمات، هيظهروا هنا
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
