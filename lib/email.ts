import { Resend } from 'resend'

let client: Resend | null = null
let warnedMissingKey = false

function getClient(): Resend | null {
  if (client) return client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (!warnedMissingKey) {
      console.warn('[email] RESEND_API_KEY not set — emails will be skipped')
      warnedMissingKey = true
    }
    return null
  }
  client = new Resend(apiKey)
  return client
}

const FROM = process.env.EMAIL_FROM || 'OpenGym <noreply@openappo.com>'

export interface SendResult {
  success: boolean
  error?: string
  /** When the email provider is not configured, we log instead of sending.
   * Useful for dev and prevents hard failures. */
  skipped?: boolean
}

/**
 * Send a password-reset email with a one-time link.
 * The link points to {APP_URL}/reset-password?token=...&email=...
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<SendResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`

  const html = `
    <div dir="rtl" style="font-family: 'Cairo', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #22C55E; font-size: 24px; margin: 0;">OpenGym</h1>
      </div>
      <h2 style="color: #0F172A; font-size: 20px;">طلب تغيير كلمة المرور</h2>
      <p style="color: #334155; line-height: 1.6;">
        استلمنا طلب لتغيير كلمة المرور الخاصة بحسابك على OpenGym.
      </p>
      <p style="color: #334155; line-height: 1.6;">
        اضغط على الزر اللي تحت عشان تختار كلمة مرور جديدة:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: #22C55E; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
          تغيير كلمة المرور
        </a>
      </div>
      <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
        الرابط ده صالح لمدة ساعة واحدة فقط. لو إنت اللي طلبت التغيير، تجاهل الإيميل ده.
        لو مش إنت اللي طلبت، ياريت تتجاهله برضه — كلمة مرورك فضلت زي ما هي.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
      <p style="color: #94A3B8; font-size: 12px; text-align: center;">
        OpenGym — إدارة الجيمات بذكاء
      </p>
    </div>
  `

  const resend = getClient()
  if (!resend) {
    // Dev/no-key mode: log the link so a dev can still complete the flow
    console.log('[email:dev] password reset link:', resetUrl)
    return { success: true, skipped: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: 'تغيير كلمة المرور — OpenGym',
      html,
    })
    if (error) {
      console.error('[email] resend error:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('[email] sendPasswordResetEmail threw:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل إرسال الإيميل',
    }
  }
}
