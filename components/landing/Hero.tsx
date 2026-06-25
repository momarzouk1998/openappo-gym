'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowLeft, Play, Users, CreditCard, TrendingUp } from 'lucide-react'

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    // Count-up animation for stats
    const counters = document.querySelectorAll('[data-counter]')
    const animateCounter = (el: Element) => {
      const target = parseInt(el.getAttribute('data-counter') || '0')
      const duration = 2000
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        el.textContent = Math.floor(eased * target).toLocaleString('ar-EG')
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 }
    )

    counters.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden grid-bg"
    >
      {/* Background glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#22C55E]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#22C55E]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 mb-6 animate-fade-in-up opacity-0"
              style={{ animationFillMode: 'forwards' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-sm text-[#4ADE80] font-medium">
                منصة #1 لإدارة الجيمات في مصر
              </span>
            </div>

            {/* Heading */}
            <h1
              className="font-cairo font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 animate-fade-in-up opacity-0 delay-100"
              style={{ animationFillMode: 'forwards' }}
            >
              إدارة جيمك
              <br />
              من <span className="text-[#22C55E]">شاشة واحدة</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg sm:text-xl text-[#94A3B8] mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up opacity-0 delay-200"
              style={{ animationFillMode: 'forwards' }}
            >
              اشتراكات، مدفوعات، تقارير، موظفين — كل حاجة في مكان واحد.
              منصة متكاملة لصاحب الجيم الحديث.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up opacity-0 delay-300"
              style={{ animationFillMode: 'forwards' }}
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all hover:shadow-xl hover:shadow-[#22C55E]/30 hover:-translate-y-0.5"
              >
                ابدأ تجربة مجانية 14 يوم
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#1F1F2E] text-white rounded-xl font-semibold hover:bg-[#111118] transition-all"
              >
                <Play className="w-4 h-4" />
                شوف كيف يشتغل
              </Link>
            </div>

            {/* Trust line */}
            <p
              className="mt-6 text-sm text-[#64748B] animate-fade-in-up opacity-0 delay-400"
              style={{ animationFillMode: 'forwards' }}
            >
              مفيش كريدت كارد مطلوب • إلغاء في أي وقت
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative animate-fade-in-up opacity-0 delay-300" style={{ animationFillMode: 'forwards' }}>
            <div className="glass-card glow-green p-6 rounded-2xl">
              {/* Mock header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F1F2E]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-sm">جيم القوة</span>
                </div>
                <span className="text-xs text-[#64748B]">لوحة التحكم</span>
              </div>

              {/* Mock stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#111118] rounded-xl p-4 border border-[#1F1F2E]">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-xs text-[#64748B]">+12</span>
                  </div>
                  <div className="text-2xl font-bold font-cairo">247</div>
                  <div className="text-xs text-[#64748B]">إجمالي الأعضاء</div>
                </div>
                <div className="bg-[#111118] rounded-xl p-4 border border-[#1F1F2E]">
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-xs text-[#64748B]">فعّال</span>
                  </div>
                  <div className="text-2xl font-bold font-cairo">198</div>
                  <div className="text-xs text-[#64748B]">اشتراكات فعّالة</div>
                </div>
              </div>

              {/* Mock chart */}
              <div className="bg-[#111118] rounded-xl p-4 border border-[#1F1F2E]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-sm font-medium">الإيرادات الشهرية</span>
                  </div>
                  <span className="text-sm font-bold text-[#22C55E]">12,400 ج</span>
                </div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 55, 45, 70, 60, 85, 75, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#22C55E]/40 to-[#22C55E] rounded-t transition-all hover:from-[#22C55E]/60"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -left-4 glass-card px-4 py-2 rounded-xl animate-float">
              <span className="text-xs font-medium text-[#22C55E]">⚡ نمو +25%</span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { value: 50, suffix: '+', label: 'جيم يثقون بنا' },
            { value: 5000, suffix: '+', label: 'عضو نشط' },
            { value: 1000000, suffix: '+', label: 'جنيه إيرادات' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold font-cairo text-white">
                <span data-counter={stat.value}>0</span>
                <span className="text-[#22C55E]">{stat.suffix}</span>
              </div>
              <div className="text-sm text-[#64748B] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
