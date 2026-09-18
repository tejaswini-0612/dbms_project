import { cn } from '@/utils/cn'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-white/60">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={cn('field', error && 'border-state-due/50 focus:border-state-due/60 focus:ring-state-due/20', className)}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-state-due">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-white/35">{hint}</p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
