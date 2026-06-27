'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, X, RefreshCw, WifiOff, Bell, BellOff, BellRing } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWARegister() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [offline, setOffline] = useState(false)
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null)
  const [showNotifBanner, setShowNotifBanner] = useState(false)

  const push = usePushNotifications()

  useEffect(() => {
    // Don't register SW in dev (it caches everything and breaks HMR)
    if (process.env.NODE_ENV !== 'production') return

    if (!('serviceWorker' in navigator)) return

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        setSwReg(reg)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true)
            }
          })
        })

        // Periodic update check (every hour)
        setInterval(() => reg.update(), 60 * 60 * 1000)
      })
      .catch((err) => console.error('SW registration failed:', err))

    // Install prompt capture
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Show install banner after 3 seconds if not dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        setTimeout(() => setShowInstall(true), 3000)
      }
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // App installed event
    window.addEventListener('appinstalled', () => {
      setShowInstall(false)
      setInstallPrompt(null)
    })

    // Offline indicator
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setOffline(!navigator.onLine)

    // Show notification permission banner once (after SW registration)
    const notifDismissed = localStorage.getItem('pwa-notif-dismissed')
    if (!notifDismissed && push.supported && push.permission === 'default') {
      const timer = setTimeout(() => setShowNotifBanner(true), 5000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', '1')
    }
    setInstallPrompt(null)
    setShowInstall(false)
  }

  const dismissInstall = () => {
    setShowInstall(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  const handleUpdate = () => {
    if (swReg?.waiting) {
      swReg.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    window.location.reload()
  }

  const handleEnableNotif = async () => {
    await push.subscribe()
    setShowNotifBanner(false)
  }

  const dismissNotifBanner = () => {
    setShowNotifBanner(false)
    localStorage.setItem('pwa-notif-dismissed', '1')
  }

  const handleToggleNotif = async () => {
    if (push.subscribed) {
      await push.unsubscribe()
    } else {
      await push.subscribe()
    }
  }

  return (
    <>
      {/* Update banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-[100] bg-[#22C55E] text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">
              في نسخة جديدة متاحة من التطبيق
            </span>
            <button
              onClick={handleUpdate}
              className="px-4 py-1.5 bg-white text-[#16A34A] rounded-lg text-sm font-bold hover:bg-white/90"
            >
              تحديث
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline indicator */}
      <AnimatePresence>
        {offline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed bottom-4 right-4 z-[100] bg-[#1F1F2E] text-[#F59E0B] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-[#F59E0B]/20"
          >
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">أنت غير متصل — وضع offline</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install prompt */}
      <AnimatePresence>
        {showInstall && installPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-4 z-[100] max-w-md mx-auto"
          >
            <div className="glass-card glow-green-sm p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-0.5">
                  ثبّت OpenGym على جهازك
                </div>
                <div className="text-xs text-muted-c">
                  افتحه بسرعة بدون متصفح
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={dismissInstall}
                  className="p-2 text-faint hover:text-white"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-bold hover:bg-[#16A34A] whitespace-nowrap"
                >
                  تثبيت
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification permission banner */}
      <AnimatePresence>
        {showNotifBanner && push.supported && push.permission === 'default' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 sm:right-4 z-[100] max-w-md mx-auto"
          >
            <div className="glass-card glow-green-sm p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                <BellRing className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-0.5">
                  فعّل الإشعارات
                </div>
                <div className="text-xs text-muted-c">
                  هيوصلك تنبيهات الاشتراكات والمدفوعات في الوقت
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={dismissNotifBanner}
                  className="p-2 text-faint hover:text-white"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEnableNotif}
                  disabled={push.loading}
                  className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-bold hover:bg-[#D97706] whitespace-nowrap disabled:opacity-50"
                >
                  {push.loading ? 'جاري...' : 'تفعيل'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification toggle indicator (small button — shows when subscribed) */}
      <AnimatePresence>
        {push.supported && push.subscribed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 z-[90]"
          >
            <button
              onClick={handleToggleNotif}
              disabled={push.loading}
              className="w-10 h-10 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center hover:bg-[#22C55E]/30 transition-colors disabled:opacity-50"
              aria-label={push.subscribed ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
              title={push.subscribed ? 'الإشعارات مفعّلة — اضغط للإيقاف' : 'تفعيل الإشعارات'}
            >
              {push.subscribed ? (
                <Bell className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <BellOff className="w-4 h-4 text-faint" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
