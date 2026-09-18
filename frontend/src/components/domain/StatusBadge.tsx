import type { ServiceStatus, InvoiceStatus } from '@/types'
import { cn } from '@/utils/cn'

type Status = ServiceStatus | InvoiceStatus | string

const configMap: Record<string, string> = {
  Pending: 'text-state-pending bg-state-pending/10 border-state-pending/20',
  'In Progress': 'text-state-progress bg-state-progress/10 border-state-progress/20',
  Completed: 'text-state-done bg-state-done/10 border-state-done/20',
  Closed: 'text-state-closed bg-white/[0.04] border-line',
  Unpaid: 'text-state-due bg-state-due/10 border-state-due/20',
  Paid: 'text-state-done bg-state-done/10 border-state-done/20',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-2xs font-medium',
        configMap[status] ?? 'text-white/50 bg-white/[0.04] border-line',
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  )
}
