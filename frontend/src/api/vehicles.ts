import { apiClient } from './client'
import type { Vehicle, CreateVehicleRequest } from '@/types'

export const vehiclesApi = {
  list: (customer_id = 1) =>
    apiClient.get<Vehicle[]>('/vehicles/', { params: { customer_id } }).then((r) => r.data),

  create: (data: CreateVehicleRequest, customer_id = 1) =>
    apiClient.post<Vehicle>('/vehicles/', data, { params: { customer_id } }).then((r) => r.data),
}
