import { apiClient } from './client'
import type {
  ServiceRequest,
  CreateServiceRequestRequest,
  UpdateStatusRequest,
  CloseRequestRequest,
} from '@/types'

export const serviceRequestsApi = {
  listMine: (customer_id = 1) =>
    apiClient.get<ServiceRequest[]>('/service-requests/mine', { params: { customer_id } }).then((r) => r.data),

  listAssigned: (mechanic_id = 1) =>
    apiClient.get<ServiceRequest[]>('/service-requests/assigned', { params: { mechanic_id } }).then((r) => r.data),

  listPending: () =>
    apiClient.get<ServiceRequest[]>('/service-requests/pending').then((r) => r.data),

  assign: (id: number, mechanic_id = 1) =>
    apiClient.patch<ServiceRequest>(`/service-requests/${id}/assign`, {}, { params: { mechanic_id } }).then((r) => r.data),

  create: (data: CreateServiceRequestRequest, customer_id = 1) =>
    apiClient.post<ServiceRequest>('/service-requests/', data, { params: { customer_id } }).then((r) => r.data),

  updateStatus: (id: number, data: UpdateStatusRequest, mechanic_id = 1) =>
    apiClient.patch<ServiceRequest>(`/service-requests/${id}/status`, data, { params: { mechanic_id } }).then((r) => r.data),

  close: (id: number, data: CloseRequestRequest, mechanic_id = 1) =>
    apiClient.post<void>(`/service-requests/${id}/close`, data, { params: { mechanic_id } }).then((r) => r.data),
}
