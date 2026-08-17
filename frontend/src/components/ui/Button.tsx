import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 hover:opacity-90',
  secondary:
    'bg-white/[0.08] border border-white/[0.12] text-white hover:bg-white/[0.12]',
  ghost: 'text-white/70 hover:text-white hover:bg-white/[0.06]',
  danger:
    'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
  outline:
    'border border-brand-500/40 text-brand-400 hover:bg-brand-500/10',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
