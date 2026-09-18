import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokenPayload, AuthUser } from '@/types'

/** Decode the JWT payload. Returns null for a malformed or expired token. */
export function parseToken(token: string): AuthUser | null {
  try {
    const segment = token.split('.')[1]
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as AuthTokenPayload

    if (payload.exp && payload.exp * 1000 < Date.now()) return null

    return {
      id: Number(payload.sub),
      name: payload.name ?? '',
      email: payload.email ?? '',
      role: payload.role,
    }
  } catch {
    return null
  }
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'vsms-auth' },
  ),
)

/** The signed-in session, or null if there is none / the token has expired. */
export function useSession() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  if (!token || !user || !parseToken(token)) return null
  return user
}
