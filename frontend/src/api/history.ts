import { apiClient } from './client'
import type { ServiceHistoryEntry } from '@/types'

export const historyApi = {
  customerHistory: (customer_id = 1) =>
    apiClient.get<ServiceHistoryEntry[]>('/history/customer', { params: { customer_id } }).then((r) => r.data),

  mechanicHistory: (mechanic_id = 1) =>
    apiClient.get<ServiceHistoryEntry[]>('/history/mechanic', { params: { mechanic_id } }).then((r) => r.data),
}
