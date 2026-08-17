import { useQuery } from '@tanstack/react-query'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/authStore'
import { Briefcase, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatDate } from '@/utils/formatDate'

export default function MechanicDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['assigned-jobs'],
    queryFn: () => serviceRequestsApi.listAssigned(1),
    refetchInterval: 30_000,
  })

  const pending = jobs?.filter((j) => j.status === 'Pending') ?? []
  const inProgress = jobs?.filter((j) => j.status === 'In Progress') ?? []
  const completed = jobs?.filter((j) => j.status === 'Completed') ?? []

  const stats = [
    {
      icon: Clock,
      label: 'Pending',
      value: isLoading ? '—' : String(pending.length),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Briefcase,
      label: 'In Progress',
      value: isLoading ? '—' : String(inProgress.length),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: isLoading ? '—' : String(completed.length),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome,{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'Mechanic'}</span> 🔧
        </h1>
        <p className="text-white/50 mt-1 text-sm">Here are your assigned jobs today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-white/50">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Active jobs preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Active Jobs</h2>
          <Link to="/mechanic/jobs">
            <Button variant="ghost" size="sm">
              All Jobs <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Spinner fullPage />
        ) : [...pending, ...inProgress].length === 0 ? (
          <Card className="text-center py-10">
            <CheckCircle className="w-10 h-10 text-emerald-400/30 mx-auto mb-3" />
            <p className="text-white/40 text-sm">All caught up! No active jobs right now.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {[...pending, ...inProgress].slice(0, 5).map((job) => (
              <Card key={job.request_id} padding="sm" className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {job.service_name ?? `Job #${job.request_id}`}
                  </p>
                  <p className="text-xs text-white/40">
                    {job.registration_number ?? `Vehicle #${job.vehicle_id}`} •{' '}
                    {formatDate(job.requested_at)}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
