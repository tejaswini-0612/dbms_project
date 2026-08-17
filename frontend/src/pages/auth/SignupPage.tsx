import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wrench, Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore, parseToken } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
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
      const response = await authApi.customerSignup(data)
      const user = parseToken(response.access_token)
      if (!user) throw new Error('Invalid token received')
      setAuth(response.access_token, user)
      navigate('/customer/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Signup failed. Please try again.'
      setApiError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-gradient rounded-2xl mb-4 shadow-lg shadow-brand-600/30">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-white/50 text-sm mt-1">Join VSMS as a customer</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              id="signup-name"
              label="Full Name"
              placeholder="Jane Doe"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="signup-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="signup-phone"
              type="tel"
              label="Phone Number"
              placeholder="9876543210"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              id="signup-password"
              type="password"
              label="Password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="signup-address"
              label="Address (optional)"
              placeholder="123 Main St, City"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.address?.message}
              {...register('address')}
            />

            {apiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            <Button
              id="signup-submit"
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
