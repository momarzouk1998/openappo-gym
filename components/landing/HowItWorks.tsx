'use client'

import { useEffect, useRef } from 'react'
import { UserPlus, ClipboardList, LineChart } from 'lucide-react'

const steps = [
  {
    number: '1',
    icon: UserPlus,
    title: 'سجّل جيمك',
    desc: 'أدخل بيانات جيمك في دقيقتين. اسم، تليفون، باقة — وإنت جاهز.',
  },
  {
    number: '2',
    icon: ClipboardList,
    title: 'أضف أعضاءك',
    desc: 'استورد قائمة الأعضاء من Excel أو أضفهم واحداً بواحد.',
  },
  {
    number: '3',
    icon: LineChart,
    title: 'إدّر وحلّل',
    desc: 'شوف أرباحك وتقاريرك لحظة بلحظة. خُذ قرارات أذكى.',
  },
]

export function HowItWorks() {
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
      { threshold: 0.2 }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-step-card]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-sm text-[#4ADE80] font-medium mb-4">
            كيف يشتغل
          </span>
          <h2 className="font-cairo font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            ابدأ في <span className="text-[#22C55E]">3 خطوات</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 right-[15%] left-[15%] h-px bg-gradient-to-l from-[#22C55E]/0 via-[#22C55E]/30 to-[#22C55E]/0" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <div
                key={i}
                data-step-card
                className="opacity-0 text-center group"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#111118] border border-[#22C55E]/30 flex items-center justify-center mx-auto transition-all group-hover:border-[#22C55E]/60 group-hover:scale-105">
                    <step.icon className="w-9 h-9 text-[#22C55E]" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#22C55E] text-white font-bold flex items-center justify-center font-cairo text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-cairo font-bold text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-[#94A3B8] leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
