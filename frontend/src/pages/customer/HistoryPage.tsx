import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { History, Car, Wrench, User, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

export default function HistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['service-history'],
    queryFn: () => historyApi.customerHistory(1),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Service History</h1>
        <p className="text-white/50 text-sm mt-1">
          All completed and closed service records
        </p>
      </div>

      {isLoading ? (
        <Spinner fullPage />
      ) : !history || history.length === 0 ? (
        <Card className="text-center py-16">
          <History className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-sm">
            No completed services yet — your history will appear here once a job is done.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <Card key={entry.request_id} className="hover:border-white/[0.14] transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-medium text-white">{entry.service_name}</p>
                    <StatusBadge status={entry.status} />
                    {entry.invoice_status && (
                      <StatusBadge status={entry.invoice_status} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <Car className="w-3 h-3" />
                      {entry.registration_number}
                    </div>
                    {entry.mechanic_name && (
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <User className="w-3 h-3" />
                        {entry.mechanic_name}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-white/40 col-span-2">
                      Requested: {formatDate(entry.requested_at)}
                      {entry.completed_at && (
                        <> • Completed: {formatDate(entry.completed_at)}</>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                {entry.total_amount != null && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(entry.total_amount)}
                    </p>
                    <p className="text-xs text-white/30">Total (incl. GST)</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
