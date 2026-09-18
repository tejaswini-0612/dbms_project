import { cn } from '@/utils/cn'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-white/60">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'field cursor-pointer appearance-none pr-8',
            '[&>option]:bg-ink-800 [&>option]:text-white',
            error && 'border-state-due/50',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-state-due">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
