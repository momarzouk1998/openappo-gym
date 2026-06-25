import { CreditCard } from 'lucide-react'

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الاشتراكات</h2>
        <p className="text-sm text-[#94A3B8]">إدارة اشتراكات الأعضاء</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'فعّالة', value: '0', color: 'text-[#22C55E]' },
          { label: 'منتهية', value: '0', color: 'text-[#EF4444]' },
          { label: 'مجمّدة', value: '0', color: 'text-[#3B82F6]' },
          { label: 'تنتهي هذا الأسبوع', value: '0', color: 'text-[#F59E0B]' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className={`text-3xl font-bold font-cairo mb-1 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-[#94A3B8]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#111118] text-sm text-[#64748B]">
              <tr>
                <th className="p-4 font-medium">العضو</th>
                <th className="p-4 font-medium">الخطة</th>
                <th className="p-4 font-medium">البداية</th>
                <th className="p-4 font-medium">النهاية</th>
                <th className="p-4 font-medium">المبلغ</th>
                <th className="p-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="p-16 text-center text-[#64748B]">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>مفيش اشتراكات بعد</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
