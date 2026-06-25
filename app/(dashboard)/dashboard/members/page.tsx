import Link from 'next/link'
import { Users, Plus, Search, Upload, Download } from 'lucide-react'

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-cairo font-bold text-2xl">الأعضاء</h2>
          <p className="text-sm text-[#94A3B8]">إجمالي الأعضاء: 0</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1F1F2E] rounded-xl text-sm hover:bg-[#111118] transition-colors">
            <Upload className="w-4 h-4" />
            استيراد
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1F1F2E] rounded-xl text-sm hover:bg-[#111118] transition-colors">
            <Download className="w-4 h-4" />
            تصدير
          </button>
          <Link
            href="/dashboard/members/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة عضو
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو التليفون أو رقم العضوية..."
            className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 pr-11 pl-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#22C55E]/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">رقم العضوية</th>
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">التليفون</th>
                <th className="p-4 font-medium">تاريخ الانتهاء</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="p-16 text-center text-[#64748B]">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg mb-1">مفيش أعضاء بعد</p>
                  <p className="text-sm">
                    ابدأ بإضافة أول عضو في جيمك
                  </p>
                  <Link
                    href="/dashboard/members/new"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#16A34A] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة أول عضو
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
