import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

export function Spinner({ size = 'md', className, fullPage = false }: SpinnerProps) {
  const icon = (
    <Loader2 className={cn('animate-spin text-brand-400', sizeMap[size], className)} />
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {icon}
      </div>
    )
  }

  return icon
}
