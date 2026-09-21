import { apiClient } from './client'
import type { AuthResponse, CustomerSignupRequest, MechanicSignupRequest, Role } from '@/types'

export const authApi = {
  /** Passwordless entry — the simulation has no sign-in step. */
  enterAs: (role: Role) =>
    apiClient.post<AuthResponse>(`/auth/enter/${role}`).then((r) => r.data),

  customerSignup: (data: CustomerSignupRequest) =>
    apiClient.post<AuthResponse>('/auth/customer/signup', data).then((r) => r.data),

  mechanicSignup: (data: MechanicSignupRequest) =>
    apiClient.post<AuthResponse>('/auth/mechanic/signup', data).then((r) => r.data),

  customerLogin: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return apiClient
      .post<AuthResponse>('/auth/customer/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data)
  },

  mechanicLogin: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return apiClient
      .post<AuthResponse>('/auth/mechanic/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data)
  },
}
