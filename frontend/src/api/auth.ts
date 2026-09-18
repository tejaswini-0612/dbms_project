import { apiClient } from './client'
import type { AuthResponse, CustomerSignupRequest, Role } from '@/types'

export const authApi = {
  /** Passwordless entry — the simulation has no sign-in step. */
  enterAs: (role: Role) =>
    apiClient.post<AuthResponse>(`/auth/enter/${role}`).then((r) => r.data),

  customerSignup: (data: CustomerSignupRequest) =>
    apiClient.post<AuthResponse>('/auth/customer/signup', data).then((r) => r.data),
}
