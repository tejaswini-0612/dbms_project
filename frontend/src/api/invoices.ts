import { apiClient } from './client'
import type { Invoice } from '@/types'

export const invoicesApi = {
  getByRequestId: (requestId: number) =>
    apiClient.get<Invoice>(`/invoices/${requestId}`).then((r) => r.data),

  /** Simulated settlement: one call marks the invoice paid in full. */
  pay: (invoiceId: number) =>
    apiClient.post<Invoice>(`/invoices/${invoiceId}/pay`).then((r) => r.data),
}
