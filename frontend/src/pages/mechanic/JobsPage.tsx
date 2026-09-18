import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { useAssignedJobs, usePendingJobs } from '@/hooks/useServiceRequests'
import { useSession } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatDateTime } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { ServiceRequest, ServiceStatus } from '@/types'

type Tab = 'mine' | 'available'

export default function JobsPage() {
  const queryClient = useQueryClient()
  const user = useSession()
  const [tab, setTab] = useState<Tab>('mine')
  const [closeTarget, setCloseTarget] = useState<number | null>(null)
  const [closeReason, setCloseReason] = useState('')
  const [closeError, setCloseError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: myJobs, isLoading: myLoading } = useAssignedJobs()
  const { data: pendingJobs, isLoading: pendingLoading } = usePendingJobs()

  const refreshJobs = () => {
    queryClient.invalidateQueries({ queryKey: ['assigned-jobs'] })
    queryClient.invalidateQueries({ queryKey: ['pending-jobs'] })
    queryClient.invalidateQueries({ queryKey: ['service-requests'] })
    queryClient.invalidateQueries({ queryKey: ['service-history'] })
  }

  const reportError = (err: unknown, fallback: string) => {
    const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
    setActionError(detail ?? fallback)
  }

  const assignMutation = useMutation({
    mutationFn: (id: number) => serviceRequestsApi.assign(id, user!.id),
    onSuccess: () => {
      setActionError(null)
      refreshJobs()
      setTab('mine')
    },
    onError: (err) => reportError(err, 'Could not accept the job.'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ServiceStatus }) =>
      serviceRequestsApi.updateStatus(id, { status }, user!.id),
    onSuccess: () => {
      setActionError(null)
      refreshJobs()
    },
    onError: (err) => reportError(err, 'Could not update the job status.'),
  })

  const closeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      serviceRequestsApi.close(id, { reason }, user!.id),
    onSuccess: () => {
      refreshJobs()
      setCloseTarget(null)
      setCloseReason('')
      setCloseError(null)
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setCloseError(detail ?? 'Could not close the request.')
    },
  })

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'mine', label: 'My jobs', count: myJobs?.length },
    { key: 'available', label: 'Available', count: pendingJobs?.length },
  ]

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="eyebrow">Jobs</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Workshop queue</h1>
      </div>

      <div className="flex gap-6 border-b border-line">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px border-b-2 pb-3 text-sm transition-colors',
              tab === key
                ? 'border-accent-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/70',
            )}
          >
            {label}
            {count !== undefined && <span className="numeric ml-2 text-white/30">{count}</span>}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
          <p className="text-xs text-state-due">{actionError}</p>
        </div>
      )}

      {tab === 'mine' &&
        (myLoading ? (
          <Spinner fullPage />
        ) : !myJobs || myJobs.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-sm text-white/40">Nothing assigned to you yet.</p>
            <Button className="mt-5" size="sm" variant="outline" onClick={() => setTab('available')}>
              See available jobs
            </Button>
          </Card>
        ) : (
          <div className="divide-rows overflow-hidden rounded-lg border border-line">
            {myJobs.map((job) => (
              <JobRow
                key={job.request_id}
                job={job}
                busy={statusMutation.isPending}
                onAdvance={(status) => statusMutation.mutate({ id: job.request_id, status })}
                onClose={() => {
                  setCloseTarget(job.request_id)
                  setCloseError(null)
                }}
              />
            ))}
          </div>
        ))}

      {tab === 'available' &&
        (pendingLoading ? (
          <Spinner fullPage />
        ) : !pendingJobs || pendingJobs.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-sm text-white/40">No unclaimed requests right now.</p>
          </Card>
        ) : (
          <div className="divide-rows overflow-hidden rounded-lg border border-line">
            {pendingJobs.map((job) => (
              <div
                key={job.request_id}
                className="flex flex-col gap-3 bg-ink-800 px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
              >
                <JobSummary job={job} />
                <Button
                  id={`assign-job-${job.request_id}`}
                  size="sm"
                  className="shrink-0"
                  loading={assignMutation.isPending}
                  onClick={() => assignMutation.mutate(job.request_id)}
                >
                  Accept job
                </Button>
              </div>
            ))}
          </div>
        ))}

      <Modal
        isOpen={closeTarget !== null}
        onClose={() => {
          setCloseTarget(null)
          setCloseReason('')
          setCloseError(null)
        }}
        title="Close request"
        size="sm"
      >
        <p className="mb-4 text-sm text-white/50">
          Closing records the request as cancelled. No invoice is raised and this cannot be undone.
        </p>

        <div className="space-y-4">
          <Input
            id="close-reason"
            label="Reason"
            placeholder="Customer cancelled the booking"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
          />

          {closeError && (
            <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
              <p className="text-xs text-state-due">{closeError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setCloseTarget(null)}
            >
              Cancel
            </Button>
            <Button
              id="close-confirm-btn"
              type="button"
              variant="danger"
              className="flex-1"
              disabled={!closeReason.trim()}
              loading={closeMutation.isPending}
              onClick={() =>
                closeTarget !== null &&
                closeMutation.mutate({ id: closeTarget, reason: closeReason.trim() })
              }
            >
              Close request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function JobSummary({ job }: { job: ServiceRequest }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-white">{job.service_name ?? `Job #${job.request_id}`}</p>
        <StatusBadge status={job.status} />
      </div>
      <p className="numeric mt-1.5 text-xs text-white/35">
        {job.registration_number ?? `Vehicle #${job.vehicle_id}`} · {formatDateTime(job.requested_at)}
      </p>
      {job.closed_reason && (
        <p className="mt-1.5 text-xs text-white/35">Closed: {job.closed_reason}</p>
      )}
    </div>
  )
}

function JobRow({
  job,
  busy,
  onAdvance,
  onClose,
}: {
  job: ServiceRequest
  busy: boolean
  onAdvance: (status: ServiceStatus) => void
  onClose: () => void
}) {
  const next: ServiceStatus | null =
    job.status === 'Pending' ? 'In Progress' : job.status === 'In Progress' ? 'Completed' : null

  return (
    <div className="flex flex-col gap-3 bg-ink-800 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
      <JobSummary job={job} />

      {next && (
        <div className="flex shrink-0 gap-2">
          <Button
            id={`advance-job-${job.request_id}`}
            size="sm"
            loading={busy}
            onClick={() => onAdvance(next)}
          >
            {next === 'In Progress' ? 'Start work' : 'Mark complete'}
          </Button>
          <Button id={`close-job-${job.request_id}`} size="sm" variant="danger" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
