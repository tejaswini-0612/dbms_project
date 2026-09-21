import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/api/auth'
import { useAuthStore, parseToken } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
})

const mechanicSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  specialization: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>
type MechanicFormData = z.infer<typeof mechanicSchema>

type RoleTab = 'customer' | 'mechanic'

export default function SignupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [role, setRole] = useState<RoleTab>('customer')
  const [apiError, setApiError] = useState<string | null>(null)

  const customerForm = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) })
  const mechanicForm = useForm<MechanicFormData>({ resolver: zodResolver(mechanicSchema) })

  const onCustomerSubmit = async (data: CustomerFormData) => {
    setApiError(null)
    try {
      const { access_token } = await authApi.customerSignup(data)
      const user = parseToken(access_token)
      if (!user) throw new Error('The server returned an invalid session token.')
      setAuth(access_token, user)
      navigate('/customer/dashboard', { replace: true })
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setApiError(
        typeof detail === 'string' ? detail : 'Could not create the account. Is the server running?',
      )
    }
  }

  const onMechanicSubmit = async (data: MechanicFormData) => {
    setApiError(null)
    try {
      const { access_token } = await authApi.mechanicSignup({
        ...data,
        specialization: data.specialization || 'General Repairs',
      })
      const user = parseToken(access_token)
      if (!user) throw new Error('The server returned an invalid session token.')
      setAuth(access_token, user)
      navigate('/mechanic/dashboard', { replace: true })
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setApiError(
        typeof detail === 'string' ? detail : 'Could not create the account. Is the server running?',
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="text-sm font-semibold tracking-[0.2em] text-white">
            VSMS
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-white/45">Register to access the Vehicle Service System.</p>
        </div>

        <div className="panel p-5">
          {/* Tabs */}
          <div className="mb-5 flex rounded-md border border-line bg-ink-900 p-1">
            {(['customer', 'mechanic'] as RoleTab[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r)
                  setApiError(null)
                }}
                className={cn(
                  'flex-1 rounded py-1.5 text-sm font-medium transition-colors',
                  role === r ? 'bg-accent-500 text-ink-900' : 'text-white/50 hover:text-white',
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {role === 'customer' ? (
            <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} noValidate className="space-y-4">
              <Input
                id="signup-customer-name"
                label="Full name"
                placeholder="Jane Doe"
                error={customerForm.formState.errors.name?.message}
                {...customerForm.register('name')}
              />
              <Input
                id="signup-customer-email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                error={customerForm.formState.errors.email?.message}
                {...customerForm.register('email')}
              />
              <Input
                id="signup-customer-phone"
                type="tel"
                label="Phone"
                placeholder="9876543210"
                error={customerForm.formState.errors.phone?.message}
                {...customerForm.register('phone')}
              />
              <Input
                id="signup-customer-password"
                type="password"
                label="Password"
                placeholder="At least 6 characters"
                error={customerForm.formState.errors.password?.message}
                {...customerForm.register('password')}
              />
              <Input
                id="signup-customer-address"
                label="Address"
                placeholder="Optional"
                error={customerForm.formState.errors.address?.message}
                {...customerForm.register('address')}
              />

              {apiError && (
                <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
                  <p className="text-xs text-state-due">{apiError}</p>
                </div>
              )}

              <Button
                id="signup-customer-submit"
                type="submit"
                size="lg"
                className="w-full"
                loading={customerForm.formState.isSubmitting}
              >
                Register as Customer
              </Button>
            </form>
          ) : (
            <form onSubmit={mechanicForm.handleSubmit(onMechanicSubmit)} noValidate className="space-y-4">
              <Input
                id="signup-mechanic-name"
                label="Full name"
                placeholder="Priya Nair"
                error={mechanicForm.formState.errors.name?.message}
                {...mechanicForm.register('name')}
              />
              <Input
                id="signup-mechanic-email"
                type="email"
                label="Email"
                placeholder="priya@vsms.com"
                error={mechanicForm.formState.errors.email?.message}
                {...mechanicForm.register('email')}
              />
              <Input
                id="signup-mechanic-phone"
                type="tel"
                label="Phone"
                placeholder="9876543210"
                error={mechanicForm.formState.errors.phone?.message}
                {...mechanicForm.register('phone')}
              />
              <Input
                id="signup-mechanic-password"
                type="password"
                label="Password"
                placeholder="At least 6 characters"
                error={mechanicForm.formState.errors.password?.message}
                {...mechanicForm.register('password')}
              />
              <Input
                id="signup-mechanic-specialization"
                label="Specialization"
                placeholder="e.g. Engine & Transmission"
                error={mechanicForm.formState.errors.specialization?.message}
                {...mechanicForm.register('specialization')}
              />

              {apiError && (
                <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
                  <p className="text-xs text-state-due">{apiError}</p>
                </div>
              )}

              <Button
                id="signup-mechanic-submit"
                type="submit"
                size="lg"
                className="w-full"
                loading={mechanicForm.formState.isSubmitting}
              >
                Register as Mechanic
              </Button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="text-white transition-colors hover:text-accent-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
