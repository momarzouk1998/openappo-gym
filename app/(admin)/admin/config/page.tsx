'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, Save, Settings2 } from 'lucide-react'
import { ADDONS } from '@/lib/addons'

interface ConfigData {
  starterPrice: number
  proPrice: number
  addonPrices: Record<string, number>
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)

  const [starterPrice, setStarterPrice] = useState('299')
  const [proPrice, setProPrice] = useState('599')
  const [addonPrices, setAddonPrices] = useState<Record<string, string>>({})

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.starterPrice) {
          setConfig(data)
          setStarterPrice(String(data.starterPrice))
          setProPrice(String(data.proPrice))
          const parsed: Record<string, string> = {}
          for (const key of Object.keys(ADDONS)) {
            parsed[key] = String(data.addonPrices?.[key] ?? ADDONS[key as keyof typeof ADDONS].price)
          }
          setAddonPrices(parsed)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const numAddons: Record<string, number> = {}
      for (const [k, v] of Object.entries(addonPrices)) {
        const n = parseInt(v)
        if (isNaN(n) || n < 0) {
          throw new Error(`سعر إضافة ${k} غير صالح`)
        }
        numAddons[k] = n
      }
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          starterPrice: parseInt(starterPrice),
          proPrice: parseInt(proPrice),
          addonPrices: numAddons,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  const inputClass =
    'w-full bg-app border border-app rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
          <Settings2 className="w-6 h-6 text-[#22C55E]" />
        </div>
        <div>
          <h2 className="font-cairo font-bold text-2xl">أسعار المنصة</h2>
          <p className="text-sm text-muted-c">
            تحكّم في أسعار الخطط والإضافات لكل الجيمات
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            تم حفظ الأسعار بنجاح
          </div>
        )}

        {/* Plan prices */}
        <div>
          <h3 className="font-cairo font-bold text-lg mb-3">أسعار الباقات</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-soft">
                Starter (ج/شهر)
              </label>
              <input
                type="number"
                min="0"
                dir="ltr"
                value={starterPrice}
                onChange={(e) => setStarterPrice(e.target.value)}
                className={`${inputClass} text-left`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-soft">
                Pro (ج/شهر)
              </label>
              <input
                type="number"
                min="0"
                dir="ltr"
                value={proPrice}
                onChange={(e) => setProPrice(e.target.value)}
                className={`${inputClass} text-left`}
              />
            </div>
          </div>
          <p className="text-xs text-faint mt-2">
            ⚠️ الأسعار دي بتتطبّق على الجيمات الجديدة. الجيمات الموجودة مش هتتأثر تلقائياً.
          </p>
        </div>

        {/* Addon prices */}
        <div>
          <h3 className="font-cairo font-bold text-lg mb-3">أسعار الإضافات</h3>
          <div className="space-y-3">
            {Object.values(ADDONS).map((addon) => (
              <div key={addon.key} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{addon.name}</div>
                  <div className="text-xs text-muted-c">{addon.description}</div>
                </div>
                <div className="w-32">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      dir="ltr"
                      value={addonPrices[addon.key] ?? ''}
                      onChange={(e) =>
                        setAddonPrices((prev) => ({ ...prev, [addon.key]: e.target.value }))
                      }
                      className={`${inputClass} py-2.5 text-left text-sm`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-faint">
                      ج
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ الأسعار
            </>
          )}
        </button>
      </form>
    </div>
  )
}
