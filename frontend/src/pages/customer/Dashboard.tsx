import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useVehicles } from '@/hooks/useVehicles'
import { useQuery } from '@tanstack/react-query'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Car, CalendarPlus, ClipboardList, Receipt, ChevronRight, Wrench } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles()

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['service-requests'],
    queryFn: () => serviceRequestsApi.listMine(1),
  })

  const activeRequests = requests?.filter(
    (r) => r.status === 'Pending' || r.status === 'In Progress',
  )

  const pendingInvoiceCount =
    requests?.filter((r) => r.status === 'Completed').length ?? 0

  const stats = [
    {
      icon: Car,
      label: 'My Vehicles',
      value: vehiclesLoading ? '—' : String(vehicles?.length ?? 0),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      link: '/customer/vehicles',
    },
    {
      icon: ClipboardList,
      label: 'Active Requests',
      value: requestsLoading ? '—' : String(activeRequests?.length ?? 0),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      link: '/customer/requests',
    },
    {
      icon: Receipt,
      label: 'Unpaid Invoices',
      value: requestsLoading ? '—' : String(pendingInvoiceCount),
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      link: '/customer/requests',
    },
  ]

  const quickActions = [
    {
      icon: CalendarPlus,
      label: 'Book a Service',
      description: 'Schedule a new service for your vehicle',
      to: '/customer/book',
    },
    {
      icon: Car,
      label: 'Add Vehicle',
      description: 'Register a new vehicle to your account',
      to: '/customer/vehicles',
    },
    {
      icon: ClipboardList,
      label: 'View Requests',
      description: 'Track your active service requests',
      to: '/customer/requests',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {getGreeting()},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
        </h1>
        <p className="text-white/50 mt-1 text-sm">
          Here's what's happening with your vehicles today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg, link }) => (
          <Link key={label} to={link}>
            <Card hover className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-white/50">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map(({ icon: Icon, label, description, to }) => (
            <Link key={to} to={to}>
              <Card hover className="h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Recent Requests</h2>
          <Link to="/customer/requests">
            <Button variant="ghost" size="sm">
              View all <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {requestsLoading ? (
          <Spinner fullPage />
        ) : !requests || requests.length === 0 ? (
          <Card className="text-center py-10">
            <Wrench className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No service requests yet</p>
            <Link to="/customer/book" className="mt-4 inline-block">
              <Button size="sm" variant="outline">
                Book your first service
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((req) => (
              <Card key={req.request_id} padding="sm" className="flex items-center gap-4">
                <div className="w-9 h-9 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {req.service_name ?? `Request #${req.request_id}`}
                  </p>
                  <p className="text-xs text-white/40">
                    {req.registration_number ?? `Vehicle #${req.vehicle_id}`} •{' '}
                    {formatDate(req.requested_at)}
                  </p>
                </div>
                <StatusChip status={req.status} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My vehicles preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">My Vehicles</h2>
          <Link to="/customer/vehicles">
            <Button variant="ghost" size="sm">
              Manage <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        {vehiclesLoading ? (
          <Spinner fullPage />
        ) : !vehicles || vehicles.length === 0 ? (
          <Card className="text-center py-8">
            <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No vehicles registered</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {vehicles.slice(0, 4).map((v) => (
              <Card key={v.vehicle_id} padding="sm" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {v.make} {v.model}
                  </p>
                  <p className="text-xs text-white/40">
                    {v.registration_number} • {v.year}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-500/15 text-amber-400',
    'In Progress': 'bg-blue-500/15 text-blue-400',
    Completed: 'bg-emerald-500/15 text-emerald-400',
    Closed: 'bg-white/10 text-white/50',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? ''}`}>
      {status}
    </span>
  )
}
