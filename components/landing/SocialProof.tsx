'use client'

import { motion } from 'motion/react'
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

export function SocialProof() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#22C55E]/5 rounded-full blur-[100px] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-sm text-[#4ADE80] font-medium mb-4">
            آراء عملائنا
          </span>
          <h2 className="font-cairo font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            صاحب جيم <span className="text-[#22C55E]">بيحب OpenGym</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="glass-card p-8 rounded-2xl relative hover:border-[#22C55E]/30 transition-colors"
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-[#22C55E]/10" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.1 + idx * 0.08,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <Star className="w-4 h-4 fill-[#22C55E] text-[#22C55E]" />
                  </motion.div>
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
