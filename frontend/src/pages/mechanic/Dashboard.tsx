import { Link } from 'react-router-dom'
import { useSession } from '@/store/authStore'
import { useAssignedJobs, usePendingJobs } from '@/hooks/useServiceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatDateTime } from '@/utils/formatDate'

export default function MechanicDashboard() {
  const user = useSession()
  const { data: jobs, isLoading } = useAssignedJobs()
  const { data: available } = usePendingJobs()

  const pending = jobs?.filter((j) => j.status === 'Pending') ?? []
  const inProgress = jobs?.filter((j) => j.status === 'In Progress') ?? []
  const completed = jobs?.filter((j) => j.status === 'Completed') ?? []
  const active = [...pending, ...inProgress]

  const stats = [
    { label: 'Assigned, not started', value: isLoading ? '—' : String(pending.length) },
    { label: 'In progress', value: isLoading ? '—' : String(inProgress.length) },
    { label: 'Completed', value: isLoading ? '—' : String(completed.length) },
    { label: 'Unclaimed', value: available ? String(available.length) : '—' },
  ]

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {user?.name?.split(' ')[0] ?? 'Workshop'}
          </h1>
        </div>
        <Link to="/mechanic/jobs">
          <Button>Go to jobs</Button>
        </Link>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-ink-800 p-5">
            <p className="eyebrow">{label}</p>
            <p className="numeric mt-3 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Active jobs</h2>
          <Link to="/mechanic/jobs" className="text-xs text-white/45 transition-colors hover:text-white">
            View all
          </Link>
        </div>

        {isLoading ? (
          <Spinner fullPage />
        ) : active.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-white/40">No active jobs right now.</p>
            <Link to="/mechanic/jobs" className="mt-4 inline-block">
              <Button size="sm" variant="outline">
                Find available work
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="divide-rows overflow-hidden rounded-lg border border-line">
            {active.slice(0, 6).map((job) => (
              <div key={job.request_id} className="flex items-center gap-4 bg-ink-800 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {job.service_name ?? `Job #${job.request_id}`}
                  </p>
                  <p className="numeric mt-1 text-xs text-white/35">
                    {job.registration_number ?? `Vehicle #${job.vehicle_id}`} ·{' '}
                    {formatDateTime(job.requested_at)}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
