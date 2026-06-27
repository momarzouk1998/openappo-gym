'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Star } from 'lucide-react'
import { PLANS } from '@/lib/billing'
import { ADDONS } from '@/lib/addons'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 14 },
  },
}

export function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const planList = Object.values(PLANS)
  const addonList = Object.values(ADDONS)

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-sm text-[#4ADE80] font-medium mb-4">
            الأسعار
          </span>
          <h2 className="font-cairo font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            أسعار واضحة — <span className="text-[#22C55E]">مفيش مفاجآت</span>
          </h2>
          <p className="text-lg text-muted-c max-w-2xl mx-auto">
            اختر الباقة المناسبة لجيمك. تبدأ تجربة مجانية 14 يوم بدون كريدت كارد.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex p-1 surface border border-app rounded-xl">
            {(['monthly', 'annual'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setBilling(option)}
                className="relative px-6 py-2 rounded-lg text-sm font-medium"
              >
                {billing === option && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 bg-[#22C55E] rounded-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className={`relative z-10 ${billing === option ? 'text-white' : 'text-muted-c'}`}>
                  {option === 'monthly' ? 'شهري' : 'سنوي'}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
        >
          {planList.map((plan) => {
            const price =
              billing === 'annual' ? Math.floor(plan.price * 12 * 0.8) : plan.price
            const isPopular = 'popular' in plan && plan.popular
            return (
              <motion.div
                key={plan.key}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`relative rounded-2xl p-8 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#22C55E]/10 to-[#111118] border-2 border-[#22C55E]/40 glow-green-sm'
                    : 'glass-card hover:border-[#22C55E]/30'
                }`}
              >
                {isPopular && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                    className="absolute -top-4 right-1/2 translate-x-1/2 px-4 py-1.5 bg-[#22C55E] rounded-full text-sm font-bold text-white flex items-center gap-1"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    الأكثر شيوعاً
                  </motion.div>
                )}

                <h3 className="font-cairo font-bold text-2xl mb-2">
                  باقة {plan.name}
                </h3>
                <div className="flex items-end gap-2 mb-1">
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold font-cairo text-white"
                  >
                    {price.toLocaleString('ar-EG')}
                  </motion.span>
                  <span className="text-faint mb-2">
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
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#22C55E]" />
                      </div>
                      <span className="text-soft">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block text-center mt-8 py-3.5 rounded-xl font-semibold transition-all ${
                    isPopular
                      ? 'bg-[#22C55E] text-white hover:bg-[#16A34A] hover:shadow-lg hover:shadow-[#22C55E]/30'
                      : 'border border-app text-white hover:surface'
                  }`}
                >
                  ابدأ تجربة مجانية 14 يوم
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Addons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h3 className="font-cairo font-bold text-2xl mb-2">إضافات اختيارية</h3>
            <p className="text-muted-c">فعّل بس اللي تحتاجه — كل إضافة منفصلة</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {addonList.map((addon, i) => (
              <motion.div
                key={addon.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="glass-card px-4 py-3 rounded-xl flex items-center gap-3 hover:border-[#22C55E]/30 transition-colors"
              >
                <span className="text-sm font-medium">{addon.name}</span>
                <span className="text-sm text-[#22C55E] font-bold">+{addon.price} ج</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
