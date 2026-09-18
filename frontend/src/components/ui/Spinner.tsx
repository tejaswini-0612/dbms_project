import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }

export function Spinner({ size = 'md', className, fullPage = false }: SpinnerProps) {
  const ring = (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full border border-white/20 border-r-accent-500 animate-spin',
        sizeMap[size],
        className,
      )}
    />
  )

  if (fullPage) {
    return <div className="flex min-h-[200px] items-center justify-center">{ring}</div>
  }

  return ring
}
