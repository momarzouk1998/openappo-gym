import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ج'
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * Build a WhatsApp deep link to message a member.
 * Returns null if phone is missing/invalid so the caller can disable the button.
 * Normalizes Egyptian formats: "01012345678" → "201012345678".
 */
export function whatsappUrl(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone) return null
  // strip everything but digits
  let digits = phone.replace(/\D/g, '')
  // Egyptian local numbers: leading 0 → replace with 20
  if (digits.startsWith('0') && !digits.startsWith('00')) {
    digits = '20' + digits.slice(1)
  }
  // already has country code (e.g. 201...) or international — keep as-is
  if (digits.length < 8) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Default renewal reminder message template (Arabic). */
export function renewalReminderMessage(
  memberName: string,
  planName: string,
  endDate: string
): string {
  return `أهلاً ${memberName} 👋\nعنوانك في الجيم: خطة "${planName}" بتاعك ${endDate}.\nتفضّل تجدّد اشتراكك عشان تكمل تمارينك؟ 💪`
}
