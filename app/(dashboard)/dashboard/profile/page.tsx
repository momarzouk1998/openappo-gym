'use client'

import { useState, useEffect } from 'react'
import { useGymStore } from '@/store/gym-store'
import { User, Lock, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useGymStore()

  // Profile (fullName + phone) section state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password section state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Hydrate from store (user.fullName / user.name) + fetch phone from /me
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '')
    }
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.fullName) setFullName(data.user.fullName)
        if (data?.profile?.phone) setPhone(data.profile.phone)
      })
      .catch(() => {
        /* non-fatal — phone just stays empty */
      })
  }, [user])

  const inputClass =
    'w-full bg-app border border-app rounded-xl py-3 px-4 text-strong focus:outline-none focus:border-[#22C55E]/50 focus:ring-2 focus:ring-[#22C55E]/20'

  // --- Save profile (fullName + phone) ---
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setProfileLoading(false)
    }
  }

  // --- Change password ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)

    // Client-side validation
    if (newPassword.length < 6) {
      setPwError('كلمة المرور الجديدة لازم 6 حروف على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('كلمة المرور وتأكيدها غير متطابقين')
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل التغيير')
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-cairo font-bold text-2xl">الصفحة الشخصية</h2>
        <p className="text-sm text-muted-c">بياناتك وكلمة المرور</p>
      </div>

      {/* Section 1: My data */}
      <form onSubmit={handleProfileSave} className="glass-card p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <User className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">بياناتي الشخصية</h3>
        </div>

        {profileError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            تم حفظ البيانات بنجاح
          </div>
        )}

        {/* Email — read-only */}
        <div>
          <label className="block text-sm font-medium mb-2 text-soft">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              dir="ltr"
              className={`${inputClass} pr-11 text-left text-faint cursor-not-allowed`}
            />
          </div>
          <p className="text-xs text-faint mt-1.5">
            البريد الإلكتروني لا يمكن تغييره
          </p>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-soft">
            الاسم الكامل *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="أحمد محمد"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2 text-soft">
            رقم التليفون
          </label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className={`${inputClass} pr-11 text-left`}
              placeholder="01012345678"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={profileLoading}
          className="w-full py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {profileLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ التغييرات'
          )}
        </button>
      </form>

      {/* Section 2: Change password */}
      <form
        onSubmit={handlePasswordChange}
        className="glass-card p-6 rounded-2xl space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="font-cairo font-bold text-lg">تغيير كلمة المرور</h3>
        </div>

        {pwError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            تم تغيير كلمة المرور بنجاح
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-soft">
            كلمة المرور الحالية *
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            dir="ltr"
            className={`${inputClass} text-left`}
            placeholder="••••••••"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-soft">
              كلمة المرور الجديدة *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              dir="ltr"
              className={`${inputClass} text-left`}
              placeholder="6 حروف على الأقل"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-soft">
              تأكيد كلمة المرور *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              dir="ltr"
              className={`${inputClass} text-left`}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pwLoading}
          className="w-full py-3.5 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pwLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري التغيير...
            </>
          ) : (
            'تغيير كلمة المرور'
          )}
        </button>
      </form>
    </div>
  )
}
