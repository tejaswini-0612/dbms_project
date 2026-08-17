import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { formatDateTime } from '@/utils/formatDate'
import {
  Briefcase,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Car,
  Calendar,
  Inbox,
  UserCheck,
} from 'lucide-react'
import type { ServiceRequest, ServiceStatus } from '@/types'
import { cn } from '@/utils/cn'

type CloseTarget = { requestId: number } | null

export default function JobsPage() {
  const queryClient = useQueryClient()
  const [closeTarget, setCloseTarget] = useState<CloseTarget>(null)
  const [closeReason, setCloseReason] = useState('')
  const [closeError, setCloseError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'mine' | 'available'>('mine')

  const { data: myJobs, isLoading: myLoading } = useQuery({
    queryKey: ['assigned-jobs'],
    queryFn: () => serviceRequestsApi.listAssigned(1),
    refetchInterval: 15_000,
  })

  const { data: pendingJobs, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-jobs'],
    queryFn: () => serviceRequestsApi.listPending(),
    refetchInterval: 15_000,
  })

  const assignMutation = useMutation({
    mutationFn: (id: number) => serviceRequestsApi.assign(id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['pending-jobs'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ServiceStatus }) =>
      serviceRequestsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-jobs'] })
    },
  })

  const closeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      serviceRequestsApi.close(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-jobs'] })
      setCloseTarget(null)
      setCloseReason('')
      setCloseError(null)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to close request.'
      setCloseError(msg)
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Jobs</h1>
        <p className="text-white/50 text-sm mt-1">
          Manage your assigned jobs or pick up available requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.08] pb-0">
        <TabBtn active={activeTab === 'mine'} onClick={() => setActiveTab('mine')} icon={<Briefcase className="w-4 h-4" />}>
          My Jobs
          {myJobs && myJobs.length > 0 && (
            <span className="ml-1.5 bg-brand-600/40 text-brand-300 text-xs px-1.5 py-0.5 rounded-full">
              {myJobs.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={activeTab === 'available'} onClick={() => setActiveTab('available')} icon={<Inbox className="w-4 h-4" />}>
          Available
          {pendingJobs && pendingJobs.length > 0 && (
            <span className="ml-1.5 bg-emerald-500/30 text-emerald-300 text-xs px-1.5 py-0.5 rounded-full">
              {pendingJobs.length}
            </span>
          )}
        </TabBtn>
      </div>

      {/* My Jobs tab */}
      {activeTab === 'mine' && (
        <>
          {myLoading ? (
            <Spinner fullPage />
          ) : !myJobs || myJobs.length === 0 ? (
            <Card className="text-center py-14">
              <Briefcase className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No jobs assigned to you yet.</p>
              <p className="text-white/25 text-xs mt-1">Switch to "Available" tab to pick up jobs.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myJobs.map((job) => (
                <JobCard
                  key={job.request_id}
                  job={job}
                  onStatusUpdate={(status) => statusMutation.mutate({ id: job.request_id, status })}
                  onClose={() => setCloseTarget({ requestId: job.request_id })}
                  isUpdating={statusMutation.isPending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Available jobs tab */}
      {activeTab === 'available' && (
        <>
          {pendingLoading ? (
            <Spinner fullPage />
          ) : !pendingJobs || pendingJobs.length === 0 ? (
            <Card className="text-center py-14">
              <Inbox className="w-12 h-12 text-white/15 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No pending jobs available right now.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <AvailableJobCard
                  key={job.request_id}
                  job={job}
                  onAssign={() => assignMutation.mutate(job.request_id)}
                  isAssigning={assignMutation.isPending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Close reason modal */}
      <Modal
        isOpen={!!closeTarget}
        onClose={() => {
          setCloseTarget(null)
          setCloseReason('')
          setCloseError(null)
        }}
        title="Close Service Request"
        size="sm"
      >
        <p className="text-sm text-white/60 mb-4">
          Provide a reason for closing this request. This cannot be undone.
        </p>
        <div className="space-y-4">
          <Input
            id="close-reason"
            label="Reason"
            placeholder="e.g. Customer requested cancellation"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
          />
          {closeError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{closeError}</p>
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
                closeTarget &&
                closeMutation.mutate({
                  id: closeTarget.requestId,
                  reason: closeReason,
                })
              }
            >
              Close Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Tab button ──────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-200',
        active
          ? 'border-brand-500 text-white'
          : 'border-transparent text-white/40 hover:text-white/70',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

// ─── JobCard (assigned) ──────────────────────────────────────────────────────

interface JobCardProps {
  job: ServiceRequest
  onStatusUpdate: (status: ServiceStatus) => void
  onClose: () => void
  isUpdating: boolean
}

function JobCard({ job, onStatusUpdate, onClose, isUpdating }: JobCardProps) {
  const canProgress = job.status === 'Pending' || job.status === 'In Progress'
  const nextStatus: ServiceStatus | null =
    job.status === 'Pending'
      ? 'In Progress'
      : job.status === 'In Progress'
      ? 'Completed'
      : null

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-brand-400" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-medium text-white">
              {job.service_name ?? `Job #${job.request_id}`}
            </p>
            <StatusBadge status={job.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Car className="w-3 h-3" />
              {job.registration_number ?? `Vehicle #${job.vehicle_id}`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              {formatDateTime(job.requested_at)}
            </div>
          </div>

          {job.closed_reason && (
            <p className="text-xs text-white/30 italic">Reason: {job.closed_reason}</p>
          )}
        </div>

        {canProgress && (
          <div className="flex gap-2 flex-shrink-0">
            {nextStatus && (
              <Button
                id={`advance-job-${job.request_id}`}
                size="sm"
                loading={isUpdating}
                onClick={() => onStatusUpdate(nextStatus)}
                icon={
                  nextStatus === 'In Progress' ? (
                    <PlayCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
              >
                {nextStatus === 'In Progress' ? 'Start' : 'Complete'}
              </Button>
            )}
            <Button
              id={`close-job-${job.request_id}`}
              size="sm"
              variant="danger"
              onClick={onClose}
              icon={<XCircle className="w-4 h-4" />}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── AvailableJobCard (unassigned pending) ───────────────────────────────────

function AvailableJobCard({
  job,
  onAssign,
  isAssigning,
}: {
  job: ServiceRequest
  onAssign: () => void
  isAssigning: boolean
}) {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Inbox className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-medium text-white">
            {job.service_name ?? `Request #${job.request_id}`}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Car className="w-3 h-3" />
              {job.registration_number ?? `Vehicle #${job.vehicle_id}`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              {formatDateTime(job.requested_at)}
            </div>
          </div>
        </div>

        <Button
          id={`assign-job-${job.request_id}`}
          size="sm"
          loading={isAssigning}
          onClick={onAssign}
          icon={<UserCheck className="w-4 h-4" />}
        >
          Accept Job
        </Button>
      </div>
    </Card>
  )
}
