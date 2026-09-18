import { Link } from 'react-router-dom'
import { useServiceRequests } from '@/hooks/useServiceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatDateTime } from '@/utils/formatDate'

export default function RequestsPage() {
  const { data: requests, isLoading } = useServiceRequests()

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Requests</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {requests?.length ?? 0} in total
          </h1>
        </div>
        <Link to="/customer/book">
          <Button>Book a service</Button>
        </Link>
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : !requests || requests.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-white/40">No service requests yet.</p>
          <Link to="/customer/book" className="mt-5 inline-block">
            <Button size="sm" variant="outline">
              Book your first service
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="divide-rows overflow-hidden rounded-lg border border-line">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="flex flex-col gap-3 bg-ink-800 px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-white">
                    {req.service_name ?? `Request #${req.request_id}`}
                  </p>
                  <StatusBadge status={req.status} />
                </div>

                <p className="numeric mt-1.5 text-xs text-white/35">
                  {req.registration_number ?? `Vehicle #${req.vehicle_id}`} ·{' '}
                  {formatDateTime(req.requested_at)}
                  {req.mechanic_name ? ` · ${req.mechanic_name}` : ''}
                </p>

                {req.closed_reason && (
                  <p className="mt-1.5 text-xs text-white/35">Closed: {req.closed_reason}</p>
                )}
              </div>

              {req.status === 'Completed' && (
                <Link to={`/customer/invoice/${req.request_id}`} className="shrink-0">
                  <Button size="sm" variant="outline">
                    View invoice
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
