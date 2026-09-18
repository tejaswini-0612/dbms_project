import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history'
import { useSession } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

export default function HistoryPage() {
  const user = useSession()

  const { data: history, isLoading } = useQuery({
    queryKey: ['service-history', user?.id],
    queryFn: () => historyApi.customerHistory(user!.id),
    enabled: !!user,
  })

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="eyebrow">History</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          {history?.length ?? 0} past {history?.length === 1 ? 'service' : 'services'}
        </h1>
        <p className="mt-1 text-sm text-white/45">Completed and closed jobs stay on record here.</p>
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : !history || history.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-white/40">
            Nothing here yet — records appear once a job is completed or closed.
          </p>
        </Card>
      ) : (
        <div className="divide-rows overflow-hidden rounded-lg border border-line">
          {history.map((entry) => (
            <div
              key={entry.request_id}
              className="flex flex-col gap-3 bg-ink-800 px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-sm text-white">{entry.service_name}</p>
                  <StatusBadge status={entry.status} />
                  {entry.invoice_status && <StatusBadge status={entry.invoice_status} />}
                </div>

                <p className="numeric mt-1.5 text-xs text-white/35">
                  {entry.registration_number}
                  {entry.mechanic_name ? ` · ${entry.mechanic_name}` : ''} ·{' '}
                  {entry.completed_at
                    ? `Completed ${formatDate(entry.completed_at)}`
                    : `Requested ${formatDate(entry.requested_at)}`}
                </p>
              </div>

              <p className="numeric shrink-0 text-sm text-white sm:text-right">
                {entry.total_amount != null ? formatCurrency(entry.total_amount) : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
