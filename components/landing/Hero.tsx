'use client'

import Link from 'next/link'
import { useRef, useState, useEffect, lazy, Suspense } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowLeft, Play, Users, CreditCard, TrendingUp, Sparkles } from 'lucide-react'

const Hero3D = lazy(() =>
  import('@/components/landing/Hero3D').then((m) => ({ default: m.Hero3D }))
)

// Animated counter using Framer Motion
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) {
      if (ref.current) ref.current.textContent = value.toLocaleString('ar-EG')
      return
    }

    const duration = 2000
    let raf = 0
    let start: number | null = null

    const step = (now: number) => {
      if (start === null) start = now
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      if (ref.current) {
        ref.current.textContent = Math.floor(eased * value).toLocaleString('ar-EG')
      }
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          raf = requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [value])

  return (
    <span>
      <span ref={ref}>0</span>
      <span className="text-[#22C55E]">{suffix}</span>
    </span>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 14 },
  },
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax transforms
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden grid-bg"
    >
      {/* Background glows */}
      <motion.div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#22C55E]/10 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#22C55E]/5 rounded-full blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            style={{ y: textY, opacity }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-center lg:text-right"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span className="text-sm text-[#4ADE80] font-medium">
                منصة #1 لإدارة الجيمات في مصر
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-cairo font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              إدارة جيمك
              <br />
              من <span className="text-[#22C55E]">شاشة واحدة</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-c mb-8 max-w-xl mx-auto lg:mx-0"
            >
              اشتراكات، مدفوعات، تقارير، موظفين — كل حاجة في مكان واحد. منصة
              متكاملة لصاحب الجيم الحديث.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all hover:shadow-xl hover:shadow-[#22C55E]/30"
                >
                  ابدأ تجربة مجانية 14 يوم
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-app text-strong rounded-xl font-semibold hover:surface transition-all"
                >
                  <Play className="w-4 h-4" />
                  شوف كيف يشتغل
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust line */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-sm text-faint"
            >
              مفيش كريدت كارد مطلوب • إلغاء في أي وقت
            </motion.p>
          </motion.div>

          {/* Visual: 3D Dumbbell + Dashboard mockup */}
          <motion.div
            style={{ y: mockupY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 70, damping: 16 }}
            className="relative"
          >
            {/* 3D Canvas behind the card */}
            <div className="absolute inset-0 -m-8 z-0 hidden lg:block">
              <Suspense fallback={null}>
                <Hero3D />
              </Suspense>
            </div>

            {/* Dashboard Mockup */}
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-card glow-green p-6 rounded-2xl relative z-10"
            >
              {/* Mock header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-app">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-[#22C55E]" />
                  </motion.div>
                  <span className="font-medium text-sm">جيم القوة</span>
                </div>
                <span className="text-xs text-faint">لوحة التحكم</span>
              </div>

              {/* Mock stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Users, value: '247', label: 'إجمالي الأعضاء', badge: '+12' },
                  { icon: CreditCard, value: '198', label: 'اشتراكات فعّالة', badge: 'فعّال' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className="surface rounded-xl p-4 border border-app"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-xs text-faint">{stat.badge}</span>
                    </div>
                    <div className="text-2xl font-bold font-cairo">{stat.value}</div>
                    <div className="text-xs text-faint">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Mock chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="surface rounded-xl p-4 border border-app"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-sm font-medium">الإيرادات الشهرية</span>
                  </div>
                  <span className="text-sm font-bold text-[#22C55E]">12,400 ج</span>
                </div>
                <div className="flex-end gap-2 h-24 flex items-end">
                  {[40, 55, 45, 70, 60, 85, 75, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#22C55E]/40 to-[#22C55E] rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1.2 + i * 0.08, type: 'spring', stiffness: 80 }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 glass-card px-4 py-2 rounded-xl z-20"
            >
              <span className="text-xs font-medium text-[#22C55E]">⚡ نمو +25%</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          style={{ opacity }}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: 50, suffix: '+', label: 'جيم يثقون بنا' },
            { value: 5000, suffix: '+', label: 'عضو نشط' },
            { value: 1000000, suffix: '+', label: 'جنيه إيرادات' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold font-cairo text-strong">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-faint mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-xs text-faint">اكتشف المزيد</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-[#64748B]/50 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-[#64748B]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
