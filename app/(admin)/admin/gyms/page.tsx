import { Building2 } from 'lucide-react'

export default function AdminGymsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الجيمات</h2>
        <p className="text-sm text-[#94A3B8]">كل الجيمات المسجّلة على المنصة</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">الجيم</th>
                <th className="p-4 font-medium">المالك</th>
                <th className="p-4 font-medium">الباقة</th>
                <th className="p-4 font-medium">الإضافات</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">الدفع القادم</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="p-16 text-center text-[#64748B]">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg mb-1">مفيش جيمات مسجّلة بعد</p>
                  <p className="text-sm">
                    لما يسجّل أصحاب الجيمات، هتظهر هنا
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
