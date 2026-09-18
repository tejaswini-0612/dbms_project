import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/api/auth'
import { useAuthStore, parseToken } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="text-sm font-semibold tracking-[0.2em] text-white">
            VSMS
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-white/45">Register as a customer to book services.</p>
        </div>

        <div className="panel p-5">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              id="signup-name"
              label="Full name"
              placeholder="Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="signup-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="signup-phone"
              type="tel"
              label="Phone"
              placeholder="9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              id="signup-password"
              type="password"
              label="Password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              id="signup-address"
              label="Address"
              placeholder="Optional"
              error={errors.address?.message}
              {...register('address')}
            />

            {apiError && (
              <div className="rounded-md border border-state-due/25 bg-state-due/10 px-3 py-2.5">
                <p className="text-xs text-state-due">{apiError}</p>
              </div>
            )}

            <Button id="signup-submit" type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-white/40">
          <Link to="/login" className="text-white transition-colors hover:text-accent-400">
            Back to portals
          </Link>
        </p>
      </div>
    </div>
  )
}
