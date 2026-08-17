import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/api/invoices'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDateTime } from '@/utils/formatDate'
import { Receipt, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { PaymentMethod } from '@/types'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Card', label: 'Card', icon: '💳' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
]

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [payOpen, setPayOpen] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('UPI')
  const [payError, setPayError] = useState<string | null>(null)

  const requestId = Number(id)

  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoice', requestId],
    queryFn: () => invoicesApi.getByRequestId(requestId),
    enabled: !!requestId,
  })

  const payMutation = useMutation({
    mutationFn: () => invoicesApi.pay(invoice!.invoice_id, { method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', requestId] })
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      setPayOpen(false)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Payment failed. Please try again.'
      setPayError(msg)
    },
  })

  if (isLoading) return <Spinner fullPage />

  if (error || !invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Invoice not found or not yet generated.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate('/customer/requests')}
          icon={<ArrowLeft />}
        >
          Back to Requests
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/customer/requests')}
          icon={<ArrowLeft />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Invoice</h1>
      </div>

      <Card>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">Invoice #{invoice.invoice_id}</p>
              <p className="text-xs text-white/40">
                Request #{invoice.request_id}
              </p>
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Line items */}
        <div className="space-y-3 border-t border-white/[0.08] pt-5">
          <InvoiceRow label="Service Amount" value={formatCurrency(invoice.amount)} />
          <InvoiceRow label="GST (18%)" value={formatCurrency(invoice.tax)} muted />
          <div className="border-t border-white/[0.08] pt-3">
            <InvoiceRow
              label="Total Payable"
              value={formatCurrency(invoice.total_amount)}
              bold
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] text-xs text-white/30 space-y-1">
          <p>Generated: {formatDateTime(invoice.generated_at)}</p>
        </div>

        {/* Pay CTA */}
        {invoice.status === 'Unpaid' && (
          <div className="mt-6">
            <Button
              id="pay-invoice-btn"
              className="w-full"
              size="lg"
              icon={<CreditCard />}
              onClick={() => setPayOpen(true)}
            >
              Pay {formatCurrency(invoice.total_amount)}
            </Button>
          </div>
        )}

        {invoice.status === 'Paid' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Payment Successful</span>
          </div>
        )}
      </Card>

      {/* Payment modal */}
      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title="Select Payment Method" size="sm">
        <div className="space-y-3 mb-5">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.value}
              id={`pay-method-${pm.value.toLowerCase()}`}
              type="button"
              onClick={() => setMethod(pm.value)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left',
                method === pm.value
                  ? 'border-brand-500/50 bg-brand-500/10'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20',
              )}
            >
              <span className="text-xl">{pm.icon}</span>
              <span className="text-sm font-medium text-white">{pm.label}</span>
              {method === pm.value && (
                <CheckCircle className="w-4 h-4 text-brand-400 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {payError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-red-400">{payError}</p>
          </div>
        )}

        <Button
          id="pay-confirm-btn"
          className="w-full"
          loading={payMutation.isPending}
          onClick={() => payMutation.mutate()}
        >
          Pay {formatCurrency(invoice.total_amount)} via {method}
        </Button>
      </Modal>
    </div>
  )
}

function InvoiceRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string
  value: string
  muted?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? 'text-white/40' : 'text-white/70'}>{label}</span>
      <span className={cn('text-white', bold && 'font-semibold text-base')}>{value}</span>
    </div>
  )
}
