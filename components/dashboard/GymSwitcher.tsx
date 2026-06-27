'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGymStore } from '@/store/gym-store'
import { ChevronDown, Check, Building2 } from 'lucide-react'

export function GymSwitcher() {
  const { gym, gyms, switchGym } = useGymStore()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!gym || gyms.length <= 1) {
    // Show gym name without dropdown if only one gym
    return gym ? (
      <div className="flex items-center gap-3 p-3 surface rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center font-bold font-cairo text-[#22C55E]">
          {gym.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate text-sm">{gym.name}</div>
        </div>
      </div>
    ) : null
  }

  const handleSwitch = (selectedGym: typeof gym) => {
    switchGym(selectedGym)
    setOpen(false)
    // Refresh the current page data
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 surface rounded-xl hover:surface-2 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center font-bold font-cairo text-[#22C55E] shrink-0">
          {gym.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="font-medium truncate text-sm">{gym.name}</div>
          <div className="text-xs text-faint">{gyms.length} جيمات</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1 surface border border-app rounded-xl overflow-hidden z-50 shadow-xl">
          {gyms.map((g) => (
            <button
              key={g.id}
              onClick={() => handleSwitch(g)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:surface-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-[#22C55E]" />
              </div>
              <span className="text-sm truncate flex-1 text-right">{g.name}</span>
              {g.id === gym.id && <Check className="w-4 h-4 text-[#22C55E] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
