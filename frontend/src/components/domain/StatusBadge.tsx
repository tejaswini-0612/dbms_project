import type { ServiceStatus, InvoiceStatus } from '@/types'
import { cn } from '@/utils/cn'

type Status = ServiceStatus | InvoiceStatus

const configMap: Record<string, { label: string; classes: string }> = {
  Pending: {
    label: 'Pending',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  'In Progress': {
    label: 'In Progress',
    classes: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  Completed: {
    label: 'Completed',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  Closed: {
    label: 'Closed',
    classes: 'bg-white/[0.06] text-white/50 border-white/10',
  },
  Unpaid: {
    label: 'Unpaid',
    classes: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
  Paid: {
    label: 'Paid',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = configMap[status] ?? { label: status, classes: 'bg-white/10 text-white/50' }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.classes,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  )
}
