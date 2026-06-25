import { Building2, CreditCard, User, Wallet } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الإعدادات</h2>
        <p className="text-sm text-[#94A3B8]">إدارة بيانات جيمك وحسابك</p>
      </div>

      {/* Gym Info */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">بيانات الجيم</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
              اسم الجيم
            </label>
            <input
              type="text"
              className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50"
              placeholder="اسم الجيم"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                التليفون
              </label>
              <input
                type="tel"
                dir="ltr"
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 text-left"
                placeholder="01012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#CBD5E1]">
                المدينة
              </label>
              <input
                type="text"
                className="w-full bg-[#0A0A0F] border border-[#1F1F2E] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50"
                placeholder="القاهرة"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">الباقة والدفع</h3>
        </div>

        <div className="p-4 bg-[#111118] rounded-xl border border-[#1F1F2E]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8]">الباقة الحالية</span>
            <span className="font-bold text-[#22C55E]">Starter</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8]">السعر الشهري</span>
            <span className="font-bold">299 ج</span>
          </div>
          <div className="pt-4 border-t border-[#1F1F2E]">
            <p className="text-sm text-[#94A3B8] mb-2">للتجديد والدفع:</p>
            <p className="text-sm">
              انستاباي / فودافون كاش:{' '}
              <span className="font-bold text-[#22C55E]" dir="ltr">
                01558282760
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
