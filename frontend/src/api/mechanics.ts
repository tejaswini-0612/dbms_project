import { apiClient } from './client'
import type { Mechanic, ServiceType } from '@/types'

export const mechanicsApi = {
  list: () =>
    apiClient.get<Mechanic[]>('/mechanics/').then((r) => r.data),
}

export const serviceTypesApi = {
  list: () =>
    apiClient.get<ServiceType[]>('/service-types/').then((r) => r.data),
}
