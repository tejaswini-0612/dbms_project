import { apiClient } from './client'
import type { Invoice, PayRequest } from '@/types'

export const invoicesApi = {
  getByRequestId: (requestId: number) =>
    apiClient.get<Invoice>(`/invoices/${requestId}`).then((r) => r.data),

  pay: (invoiceId: number, data: PayRequest) =>
    apiClient.post<void>(`/invoices/${invoiceId}/pay`, data).then((r) => r.data),
}
