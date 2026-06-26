import { create } from 'zustand'

interface GymData {
  id: string
  name: string
  slug: string
  status: string
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  fullName: string
}

interface GymStore {
  gym: GymData | null
  user: UserData | null
  gyms: GymData[]
  loading: boolean
  initialized: boolean
  setGym: (gym: GymData) => void
  setUser: (user: UserData) => void
  setGyms: (gyms: GymData[]) => void
  initialize: (data: { gym: GymData; user: UserData; gyms: GymData[] }) => void
  switchGym: (gym: GymData) => void
  reset: () => void
}

export const useGymStore = create<GymStore>((set) => ({
  gym: null,
  user: null,
  gyms: [],
  loading: true,
  initialized: false,

  setGym: (gym) => set({ gym }),
  setUser: (user) => set({ user }),
  setGyms: (gyms) => set({ gyms }),

  initialize: (data) => set({
    gym: data.gym,
    user: data.user,
    gyms: data.gyms,
    loading: false,
    initialized: true,
  }),

  switchGym: (gym) => set({ gym }),

  reset: () => set({
    gym: null,
    user: null,
    gyms: [],
    loading: true,
    initialized: false,
  }),
}))
