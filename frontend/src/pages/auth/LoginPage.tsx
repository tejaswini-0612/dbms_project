import { useNavigate } from 'react-router-dom'
import { Wrench, User, Wrench as MechanicIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

export default function LoginPage() {
  const navigate = useNavigate()
  const setRole = useAuthStore((s) => s.setRole)

  const enter = (role: Role) => {
    setRole(role)
    navigate(role === 'customer' ? '/customer/dashboard' : '/mechanic/dashboard', {
      replace: true,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gradient rounded-2xl mb-4 shadow-lg shadow-brand-600/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">VSMS</h1>
          <p className="text-white/50 text-sm mt-2">Vehicle Service Management System</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-center text-white font-semibold text-lg mb-2">Enter as</h2>
          <p className="text-center text-white/40 text-sm mb-8">Choose your role to continue</p>

          <div className="space-y-4">
            <button
              id="enter-customer"
              onClick={() => enter('customer')}
              className="w-full group flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-brand-600/20 hover:border-brand-500/50 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-600/30 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Customer</p>
                <p className="text-white/40 text-sm">Book services, track vehicles, pay invoices</p>
              </div>
              <span className="ml-auto text-white/30 group-hover:text-white/60 text-xl">→</span>
            </button>

            <button
              id="enter-mechanic"
              onClick={() => enter('mechanic')}
              className="w-full group flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <MechanicIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Mechanic</p>
                <p className="text-white/40 text-sm">View assigned jobs, update service status</p>
              </div>
              <span className="ml-auto text-white/30 group-hover:text-white/60 text-xl">→</span>
            </button>
          </div>

          <p className="text-center text-xs text-white/25 mt-8">
            Authentication disabled — demo mode
          </p>
        </div>
      </div>
    </div>
  )
}
