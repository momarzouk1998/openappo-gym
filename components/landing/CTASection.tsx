'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-12 sm:p-16 text-center">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A] via-[#22C55E] to-[#16A34A]" />
          <div className="absolute inset-0 grid-bg opacity-20" />

          {/* Decorative glows */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                جاهز تبدأ؟
              </span>
            </div>

            <h2 className="font-cairo font-black text-4xl sm:text-5xl text-white mb-4">
              ابدأ تجربتك المجانية دلوقتي
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              انضم لـ +50 جيم بيستخدموا OpenGym لإدارة أعمالهم بشكل أذكى
            </p>

            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#16A34A] rounded-xl font-bold hover:bg-white/95 transition-all hover:shadow-2xl hover:-translate-y-0.5"
            >
              جرّب مجاناً 14 يوم
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <p className="mt-6 text-sm text-white/80">
              مفيش كريدت كارد — مفيش التزام
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
