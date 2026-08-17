import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types'

interface AuthState {
  role: Role | null
  user_id: number | null
  setRole: (role: Role) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      user_id: null,
      setRole: (role: Role) =>
        // Hardcode user_id: 1 = customer, 1 = mechanic (seeded demo data)
        set({ role, user_id: 1 }),
      logout: () => set({ role: null, user_id: null }),
    }),
    {
      name: 'vsms-auth',
    },
  ),
)
