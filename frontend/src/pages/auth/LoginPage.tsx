import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore, parseToken } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import type { Role } from '@/types'

const PORTALS: { role: Role; title: string; description: string }[] = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Register vehicles, book services, track requests and settle invoices.',
  },
  {
    role: 'mechanic',
    title: 'Mechanic',
    description: 'Pick up requests from the queue, advance job status and close requests.',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [pending, setPending] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enter = async (role: Role) => {
    setError(null)
    setPending(role)
    try {
      const { access_token } = await authApi.enterAs(role)
      const user = parseToken(access_token)
      if (!user) throw new Error('The server returned an invalid session token.')
      setAuth(access_token, user)
      navigate(`/${user.role}/dashboard`, { replace: true })
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail ?? 'Could not open the portal. Is the server running?')
      setPending(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="text-sm font-semibold tracking-[0.2em] text-white">
            VSMS
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-white">Choose a portal</h1>
          <p className="mt-1 text-sm text-white/45">
            Vehicle Service Management System
          </p>
        </div>

        <div className="space-y-3">
          {PORTALS.map(({ role, title, description }) => (
            <button
              key={role}
              id={`enter-${role}`}
              type="button"
              disabled={pending !== null}
              onClick={() => enter(role)}
              className={cn(
                'group flex w-full items-center gap-4 rounded-lg border border-line bg-ink-800 px-5 py-5 text-left',
                'transition-colors duration-150 hover:border-accent-500/50 hover:bg-ink-700',
                'focus-visible:outline-none focus-visible:border-accent-500/60',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-white/45">
                  {description}
                </span>
              </span>
              {pending === role ? (
                <Spinner size="sm" />
              ) : (
                <span
                  aria-hidden="true"
                  className="shrink-0 text-white/25 transition-colors group-hover:text-accent-500"
                >
                  &rarr;
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
            <p className="text-xs text-state-due">{error}</p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-white/40">
          Need a fresh customer account?{' '}
          <Link to="/signup" className="text-white transition-colors hover:text-accent-400">
            Register one
          </Link>
        </p>
      </div>
    </div>
  )
}
