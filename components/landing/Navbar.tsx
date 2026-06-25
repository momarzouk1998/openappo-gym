'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Dumbbell } from 'lucide-react'

const navLinks = [
  { href: '#features', label: 'المميزات' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#how', label: 'كيف يشتغل' },
  { href: '#contact', label: 'تواصل معنا' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#1F1F2E]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center transition-transform group-hover:scale-110">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-cairo font-bold text-xl text-white">
            Open<span className="text-[#22C55E]">Gym</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-medium bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-all hover:shadow-lg hover:shadow-[#22C55E]/30"
          >
            ابدأ مجاناً
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white"
          aria-label="القائمة"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-lg border-b border-[#1F1F2E]">
          <ul className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#94A3B8] hover:text-white hover:bg-[#111118] rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-[#1F1F2E]">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-3 px-4 text-[#94A3B8] hover:text-white hover:bg-[#111118] rounded-lg transition-colors"
              >
                تسجيل الدخول
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="block py-3 px-4 text-center text-white bg-[#22C55E] rounded-lg font-medium"
              >
                ابدأ مجاناً
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
