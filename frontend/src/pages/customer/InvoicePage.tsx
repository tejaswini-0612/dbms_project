import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/api/invoices'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDateTime } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [payError, setPayError] = useState<string | null>(null)

  const requestId = Number(id)

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoice', requestId],
    queryFn: () => invoicesApi.getByRequestId(requestId),
    enabled: Number.isFinite(requestId),
  })

  const payMutation = useMutation({
    mutationFn: () => invoicesApi.pay(invoice!.invoice_id),
    onSuccess: (updated) => {
      queryClient.setQueryData(['invoice', requestId], updated)
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['service-history'] })
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setPayError(detail ?? 'The payment could not be recorded. Is the server running?')
    },
  })

  if (isLoading) return <Spinner fullPage />

  if (isError || !invoice) {
    return (
      <div className="animate-fade-in py-16 text-center">
        <p className="text-sm text-white/40">
          No invoice for this request yet — one is raised when the job is completed.
        </p>
        <Button className="mt-5" size="sm" variant="outline" onClick={() => navigate('/customer/requests')}>
          Back to requests
        </Button>
      </div>
    )
  }

  const isPaid = invoice.status === 'Paid'

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Invoice</p>
          <h1 className="numeric mt-2 text-2xl font-semibold text-white">
            #{invoice.invoice_id}
          </h1>
        </div>
        <Button size="sm" variant="ghost" onClick={() => navigate('/customer/requests')}>
          Back
        </Button>
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="numeric text-sm text-white">Request #{invoice.request_id}</p>
            <p className="mt-0.5 text-xs text-white/35">
              Raised {formatDateTime(invoice.generated_at)}
            </p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <dl className="divide-rows">
          <Row label="Service amount">{formatCurrency(invoice.amount)}</Row>
          <Row label="GST (18%)">{formatCurrency(invoice.tax)}</Row>
          <Row label="Total payable" emphasis>
            {formatCurrency(invoice.total_amount)}
          </Row>
        </dl>

        <div className="border-t border-line px-5 py-5">
          {isPaid ? (
            <div className="rounded-md border border-state-done/25 bg-state-done/10 px-4 py-3 text-center">
              <p className="text-sm font-medium text-state-done">Paid in full</p>
              <p className="mt-1 text-xs text-white/40">
                {formatCurrency(invoice.total_amount)} settled
              </p>
            </div>
          ) : (
            <>
              {payError && (
                <div className="mb-4 rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
                  <p className="text-xs text-state-due">{payError}</p>
                </div>
              )}
              <Button
                id="pay-invoice-btn"
                size="lg"
                className="w-full"
                loading={payMutation.isPending}
                onClick={() => {
                  setPayError(null)
                  payMutation.mutate()
                }}
              >
                Pay {formatCurrency(invoice.total_amount)}
              </Button>
              <p className="mt-3 text-center text-xs text-white/30">
                Simulated payment — the invoice is marked paid immediately.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

function Row({
  label,
  children,
  emphasis,
}: {
  label: string
  children: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className={cn('text-xs', emphasis ? 'text-white/70' : 'text-white/45')}>{label}</dt>
      <dd
        className={cn(
          'numeric text-sm',
          emphasis ? 'text-base font-semibold text-accent-500' : 'text-white',
        )}
      >
        {children}
      </dd>
    </div>
  )
}
