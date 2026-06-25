export const WHATSAPP_TEMPLATES = {
  renewalReminder: (
    name: string,
    daysLeft: number,
    gymName: string
  ): string =>
    `السلام عليكم ${name} 🏋️\nاشتراكك في ${gymName} هينتهي خلال ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}.\nللتجديد تواصل معنا ☎️`,

  welcome: (name: string, gymName: string, endDate: string): string =>
    `مرحباً ${name} في ${gymName} 🎉\nاشتراكك فعّال حتى ${endDate}.\nنتمنالك تجربة رائعة! 💪`,

  expired: (name: string, gymName: string): string =>
    `السلام عليكم ${name}\nاشتراكك في ${gymName} انتهى.\nجدد اشتراكك دلوقتي واكمل رحلتك! 💪`,
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const internationalPhone = cleanPhone.startsWith('0')
    ? '2' + cleanPhone
    : cleanPhone.startsWith('20')
      ? cleanPhone
      : '2' + cleanPhone

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
}
