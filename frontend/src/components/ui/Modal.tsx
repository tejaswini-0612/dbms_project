import { cn } from '@/utils/cn'
import { useEffect, useCallback } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onClose} />

      <div className={cn('relative w-full panel bg-ink-800 shadow-2xl animate-rise', sizeMap[size])}>
        {title && (
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <h2 id="modal-title" className="text-sm font-semibold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded px-2 pb-1 text-lg leading-none text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
