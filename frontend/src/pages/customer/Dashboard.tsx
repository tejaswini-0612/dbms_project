import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/store/authStore'
import { historyApi } from '@/api/history'
import { useVehicles } from '@/hooks/useVehicles'
import { useServiceRequests } from '@/hooks/useServiceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatDate } from '@/utils/formatDate'

export default function CustomerDashboard() {
  const user = useSession()
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles()
  const { data: requests, isLoading: requestsLoading } = useServiceRequests()

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['service-history', user?.id],
    queryFn: () => historyApi.customerHistory(user!.id),
    enabled: !!user,
  })

  const active = requests?.filter((r) => r.status === 'Pending' || r.status === 'In Progress') ?? []
  const unpaid = history?.filter((h) => h.invoice_status === 'Unpaid') ?? []

  const stats = [
    {
      label: 'Vehicles',
      value: vehiclesLoading ? '—' : String(vehicles?.length ?? 0),
      to: '/customer/vehicles',
    },
    {
      label: 'Active requests',
      value: requestsLoading ? '—' : String(active.length),
      to: '/customer/requests',
    },
    {
      label: 'Unpaid invoices',
      value: historyLoading ? '—' : String(unpaid.length),
      to: '/customer/requests',
    },
  ]

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {user?.name?.split(' ')[0] ?? 'Welcome'}
          </h1>
        </div>
        <Link to="/customer/book">
          <Button>Book a service</Button>
        </Link>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {stats.map(({ label, value, to }) => (
          <Link key={label} to={to} className="bg-ink-800 p-5 transition-colors hover:bg-ink-700">
            <p className="eyebrow">{label}</p>
            <p className="numeric mt-3 text-3xl font-semibold text-white">{value}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent requests</h2>
          <Link to="/customer/requests" className="text-xs text-white/45 transition-colors hover:text-white">
            View all
          </Link>
        </div>

        {requestsLoading ? (
          <Spinner fullPage />
        ) : !requests || requests.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-white/40">No service requests yet.</p>
            <Link to="/customer/book" className="mt-4 inline-block">
              <Button size="sm" variant="outline">
                Book your first service
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="divide-rows overflow-hidden rounded-lg border border-line">
            {requests.slice(0, 5).map((req) => (
              <div key={req.request_id} className="flex items-center gap-4 bg-ink-800 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {req.service_name ?? `Request #${req.request_id}`}
                  </p>
                  <p className="numeric mt-1 text-xs text-white/35">
                    {req.registration_number ?? `Vehicle #${req.vehicle_id}`} ·{' '}
                    {formatDate(req.requested_at)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Vehicles</h2>
          <Link to="/customer/vehicles" className="text-xs text-white/45 transition-colors hover:text-white">
            Manage
          </Link>
        </div>

        {vehiclesLoading ? (
          <Spinner fullPage />
        ) : !vehicles || vehicles.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-white/40">No vehicles registered.</p>
            <Link to="/customer/vehicles" className="mt-4 inline-block">
              <Button size="sm" variant="outline">
                Add a vehicle
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {vehicles.slice(0, 4).map((v) => (
              <div key={v.vehicle_id} className="bg-ink-800 px-5 py-4">
                <p className="text-sm text-white">
                  {v.make} {v.model}
                </p>
                <p className="numeric mt-1 text-xs text-white/35">
                  {v.registration_number} · {v.year}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
