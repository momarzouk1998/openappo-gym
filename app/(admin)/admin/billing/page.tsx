import { Receipt } from 'lucide-react'

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الفواتير</h2>
        <p className="text-sm text-muted-c">
          فواتير الجيمات والمدفوعات الواردة
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الفواتير', value: '0' },
          { label: 'مدفوعة', value: '0' },
          { label: 'معلّقة', value: '0' },
          { label: 'إجمالي المحصّل', value: '0 ج' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className="text-2xl font-bold font-cairo mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-c">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="surface text-sm text-faint">
              <tr>
                <th className="p-4 font-medium">الجيم</th>
                <th className="p-4 font-medium">الفترة</th>
                <th className="p-4 font-medium">الإجمالي</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">تاريخ الدفع</th>
                <th className="p-4 font-medium">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="p-16 text-center text-faint">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>مفيش فواتير بعد</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
