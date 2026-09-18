import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-7',
  none: '',
}

export function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'panel',
        paddingMap[padding],
        hover && 'hover:border-line-strong hover:bg-ink-700 transition-colors duration-150',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4 flex items-center justify-between', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold text-white', className)}>{children}</h3>
}
