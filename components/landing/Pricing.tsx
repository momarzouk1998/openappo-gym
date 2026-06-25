'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Check, Star } from 'lucide-react'
import { PLANS } from '@/lib/billing'
import { ADDONS } from '@/lib/addons'

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            entry.target.classList.remove('opacity-0')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-pricing-card]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const planList = Object.values(PLANS)
  const addonList = Object.values(ADDONS)

  return (
    <section id="pricing" ref={sectionRef} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-sm text-[#4ADE80] font-medium mb-4">
            الأسعار
          </span>
          <h2 className="font-cairo font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            أسعار واضحة — <span className="text-[#22C55E]">مفيش مفاجآت</span>
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            اختر الباقة المناسبة لجيمك. تبدأ تجربة مجانية 14 يوم بدون كريدت كارد.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {planList.map((plan, i) => {
            const price =
              billing === 'annual' ? Math.floor(plan.price * 12 * 0.8) : plan.price
            return (
              <div
                key={plan.key}
                data-pricing-card
                className={`opacity-0 relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  'popular' in plan && plan.popular
                    ? 'bg-gradient-to-b from-[#22C55E]/10 to-[#111118] border-2 border-[#22C55E]/40 glow-green-sm'
                    : 'glass-card hover:border-[#22C55E]/30'
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {'popular' in plan && plan.popular && (
                  <div className="absolute -top-4 right-1/2 translate-x-1/2 px-4 py-1.5 bg-[#22C55E] rounded-full text-sm font-bold text-white flex items-center gap-1">
                    <Star className="w-4 h-4 fill-white" />
                    الأكثر شيوعاً
                  </div>
                )}

                <h3 className="font-cairo font-bold text-2xl mb-2">
                  باقة {plan.name}
                </h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-bold font-cairo text-white">
                    {price.toLocaleString('ar-EG')}
                  </span>
                  <span className="text-[#64748B] mb-2">
                    ج / {billing === 'annual' ? 'سنة' : 'شهر'}
                  </span>
                </div>
                {billing === 'annual' && (
                  <p className="text-sm text-[#22C55E] mb-6">
                    وفّر 20% مع الاشتراك السنوي
                  </p>
                )}

                <ul className="space-y-3 mt-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#22C55E]" />
                      </div>
                      <span className="text-[#CBD5E1]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block text-center mt-8 py-3.5 rounded-xl font-semibold transition-all ${
                    'popular' in plan && plan.popular
                      ? 'bg-[#22C55E] text-white hover:bg-[#16A34A] hover:shadow-lg hover:shadow-[#22C55E]/30'
                      : 'border border-[#1F1F2E] text-white hover:bg-[#111118]'
                  }`}
                >
                  ابدأ تجربة مجانية 14 يوم
                </Link>
              </div>
            )
          })}
        </div>

        {/* Addons */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-cairo font-bold text-2xl mb-2">
              إضافات اختيارية
            </h3>
            <p className="text-[#94A3B8]">فعّل بس اللي تحتاجه — كل إضافة منفصلة</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {addonList.map((addon) => (
              <div
                key={addon.key}
                className="glass-card px-4 py-3 rounded-xl flex items-center gap-3 hover:border-[#22C55E]/30 transition-colors"
              >
                <span className="text-sm font-medium">{addon.name}</span>
                <span className="text-sm text-[#22C55E] font-bold">
                  +{addon.price} ج
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
