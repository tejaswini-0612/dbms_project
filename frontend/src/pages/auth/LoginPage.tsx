import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore, parseToken } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

type Tab = 'customer' | 'mechanic'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  // Active tab
  const [tab, setTab] = useState<Tab>('customer')

  // Shared form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const switchTab = (t: Tab) => {
    setTab(t)
    setEmail('')
    setPassword('')
    setLoginError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const { access_token } =
        tab === 'customer'
          ? await authApi.customerLogin(email, password)
          : await authApi.mechanicLogin(email, password)
      const user = parseToken(access_token)
      if (!user) throw new Error('Invalid session token.')
      setAuth(access_token, user)
      navigate(`/${user.role}/dashboard`, { replace: true })
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setLoginError(detail ?? 'Incorrect email or password.')
      setLoginLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div>
          <Link to="/" className="text-sm font-semibold tracking-[0.2em] text-white">
            VSMS
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-white/45">Vehicle Service Management System</p>
        </div>

        {/* ── Email / password login ── */}
        <div className="panel p-5">
          {/* Tabs */}
          <div className="mb-5 flex rounded-md border border-line bg-ink-900 p-1">
            {(['customer', 'mechanic'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={cn(
                  'flex-1 rounded py-1.5 text-sm font-medium transition-colors',
                  tab === t
                    ? 'bg-accent-500 text-ink-900'
                    : 'text-white/50 hover:text-white',
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="login-email"
              type="email"
              label="Email"
              placeholder={tab === 'customer' ? 'you@example.com' : 'mechanic@vsms.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="login-password"
              type="password"
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {loginError && (
              <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
                <p className="text-xs text-state-due">{loginError}</p>
              </div>
            )}
            <Button
              id="login-submit"
              type="submit"
              size="lg"
              className="w-full"
              loading={loginLoading}
            >
              Login as {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white transition-colors hover:text-accent-400">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
