'use client'

import { useEffect, useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'أحمد محمود',
    role: 'صاحب جيم القوة',
    city: 'القاهرة',
    text: 'بعد ما بدأت أستخدم OpenGym، ربحت ساعات يومياً. كل الاشتراكات والمدفوعات في مكان واحد، والواتساب بيبعت تذكيرات تلقائياً.',
    rating: 5,
  },
  {
    name: 'محمد عبد الله',
    role: 'مدير جيم الأبطال',
    city: 'الإسكندرية',
    text: 'أحسن استثمار عملته. التقارير خلّتني أفهم أرباحي بشكل أوضح، وادّير 3 فروع من شاشة واحدة.',
    rating: 5,
  },
  {
    name: 'خالد السيد',
    role: 'صاحب Fitness Hub',
    city: 'الجيزة',
    text: 'النظام سهل جداً ومش محتاج خبرة تقنية. الموظفين بتوعي اتعلموه في يوم. مدفوعات الأعضاء بقت منظمة.',
    rating: 5,
  },
]

export function SocialProof() {
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

    const cards = sectionRef.current?.querySelectorAll('[data-testimonial-card]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#22C55E]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-sm text-[#4ADE80] font-medium mb-4">
            آراء عملائنا
          </span>
          <h2 className="font-cairo font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            صاحب جيم <span className="text-[#22C55E]">بيحب OpenGym</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              data-testimonial-card
              className="opacity-0 glass-card p-8 rounded-2xl relative hover:border-[#22C55E]/30 transition-all"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-[#22C55E]/10" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 fill-[#22C55E] text-[#22C55E]"
                  />
                ))}
              </div>

              <p className="text-[#CBD5E1] leading-relaxed mb-6 relative z-10">
                {t.text}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[#1F1F2E]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold font-cairo">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-[#64748B]">
                    {t.role} — {t.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
