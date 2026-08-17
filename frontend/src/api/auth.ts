import { apiClient } from './client'
import type { AuthResponse, LoginRequest, CustomerSignupRequest } from '@/types'

export const authApi = {
  customerSignup: (data: CustomerSignupRequest) =>
    apiClient.post<AuthResponse>('/auth/customer/signup', data).then((r) => r.data),

  customerLogin: (data: Omit<LoginRequest, 'role'>) => {
    const params = new URLSearchParams()
    params.append('username', data.email)
    params.append('password', data.password)
    return apiClient.post<AuthResponse>('/auth/customer/login', params).then((r) => r.data)
  },

  mechanicLogin: (data: Omit<LoginRequest, 'role'>) => {
    const params = new URLSearchParams()
    params.append('username', data.email)
    params.append('password', data.password)
    return apiClient.post<AuthResponse>('/auth/mechanic/login', params).then((r) => r.data)
  },
}
