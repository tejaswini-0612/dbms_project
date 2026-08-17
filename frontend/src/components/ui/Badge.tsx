import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error' | 'purple'
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/[0.08] text-white/70',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  error: 'bg-red-500/15 text-red-400 border border-red-500/20',
  purple: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
