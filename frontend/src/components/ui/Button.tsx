import { cn } from '@/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent-500 text-ink-900 font-semibold hover:bg-accent-400',
  secondary: 'bg-white/[0.06] border border-line text-white hover:bg-white/[0.10]',
  ghost: 'text-white/60 hover:text-white hover:bg-white/[0.06]',
  danger: 'border border-state-due/30 text-state-due hover:bg-state-due/10',
  outline: 'border border-line-strong text-white hover:bg-white/[0.06]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-sm rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500/50',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full border border-current border-r-transparent animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
