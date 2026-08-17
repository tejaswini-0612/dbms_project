import { Link } from 'react-router-dom'
import { useServiceRequests } from '@/hooks/useServiceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { CalendarPlus, Wrench, Receipt, ChevronRight, User } from 'lucide-react'
import { formatDateTime } from '@/utils/formatDate'

export default function RequestsPage() {
  const { data: requests, isLoading } = useServiceRequests()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Requests</h1>
          <p className="text-white/50 text-sm mt-1">
            All your service requests and their current status
          </p>
        </div>
        <Link to="/customer/book">
          <Button icon={<CalendarPlus />}>Book Service</Button>
        </Link>
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : !requests || requests.length === 0 ? (
        <Card className="text-center py-16">
          <Wrench className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 mb-6 text-sm">No service requests yet</p>
          <Link to="/customer/book">
            <Button icon={<CalendarPlus />}>Book your first service</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.request_id} className="hover:border-white/[0.14] transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-brand-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-white">
                        {req.service_name ?? `Service Request #${req.request_id}`}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {req.registration_number ?? `Vehicle #${req.vehicle_id}`} •{' '}
                        Requested {formatDateTime(req.requested_at)}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {req.mechanic_name && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                      <User className="w-3 h-3" />
                      {req.mechanic_name}
                    </div>
                  )}

                  {req.closed_reason && (
                    <p className="text-xs text-white/30 mt-1.5 italic">
                      Reason: {req.closed_reason}
                    </p>
                  )}
                </div>

                {/* Invoice CTA */}
                {req.status === 'Completed' && (
                  <Link
                    to={`/customer/invoice/${req.request_id}`}
                    className="flex-shrink-0"
                  >
                    <Button variant="outline" size="sm" icon={<Receipt />}>
                      View Invoice
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
