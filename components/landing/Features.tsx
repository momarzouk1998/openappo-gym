'use client'

import { useEffect, useRef } from 'react'
import {
  CreditCard,
  Wallet,
  Users,
  BarChart3,
  Smartphone,
  Building2,
} from 'lucide-react'

const features = [
  {
    icon: CreditCard,
    title: 'إدارة الاشتراكات',
    desc: 'أضف وجدد اشتراكات في ثوانٍ. خطط مرنة شهري، ربعي، سنوي.',
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10',
  },
  {
    icon: Wallet,
    title: 'تتبع المدفوعات',
    desc: 'كاش، انستاباي، فودافون كاش — كل طرق الدفع في مكان واحد.',
    color: 'text-[#4ADE80]',
    bg: 'bg-[#4ADE80]/10',
  },
  {
    icon: Users,
    title: 'إدارة الأعضاء',
    desc: 'بيانات كاملة لكل عضو، تاريخ اشتراكاته، صورة، رقم قومي.',
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10',
  },
  {
    icon: BarChart3,
    title: 'تقارير فورية',
    desc: 'أرباح، مصروفات، إحصائيات — كلها لحظية وواضحة.',
    color: 'text-[#4ADE80]',
    bg: 'bg-[#4ADE80]/10',
  },
  {
    icon: Smartphone,
    title: 'يشتغل على الموبايل',
    desc: 'PWA — يُثبّت كتطبيق على موبايلك. زي التطبيق بالظبط.',
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10',
  },
  {
    icon: Building2,
    title: 'أكتر من فرع',
    desc: 'إدارة كل فروعك من مكان واحد، تقارير مقارنة بين الفروع.',
    color: 'text-[#4ADE80]',
    bg: 'bg-[#4ADE80]/10',
  },
]

export function Features() {
  const sectionRef = useRef<HTMLElement>(null)

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
      { threshold: 0.15 }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-feature-card]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-sm text-[#4ADE80] font-medium mb-4">
            المميزات
          </span>
          <h2 className="font-cairo font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            كل اللي <span className="text-[#22C55E]">جيمك محتاجه</span>
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            نظام واحد فيه كل أدوات إدارة الجيم. من الأعضاء والاشتراكات للتقارير
            والمصروفات.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              data-feature-card
              className="opacity-0 glass-card p-8 rounded-2xl hover:border-[#22C55E]/30 transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="font-cairo font-bold text-xl mb-3">
                {feature.title}
              </h3>
              <p className="text-[#94A3B8] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
