import { Link, useNavigate } from 'react-router-dom'
import { Wrench, Shield, Clock, Star, ChevronRight, Car, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

const features = [
  {
    icon: Car,
    title: 'Multi-Vehicle Support',
    description: 'Manage all your vehicles from a single account — cars, bikes, trucks.',
  },
  {
    icon: Clock,
    title: 'Real-Time Status',
    description: 'Track your service request live — from Pending to Completed.',
  },
  {
    icon: Shield,
    title: 'Auto-Generated Invoices',
    description: 'Invoices are generated automatically the moment your job is done.',
  },
  {
    icon: Star,
    title: 'Full Service History',
    description: 'Every completed service is permanently recorded for future reference.',
  },
]

const steps = [
  'Register & add your vehicles',
  'Book a service — pick type & mechanic',
  'Track status in real time',
  'Pay invoice online when done',
]

export default function LandingPage() {
  const { token, user } = useAuthStore()
  const navigate = useNavigate()

  // Redirect already-logged-in users
  useEffect(() => {
    if (token && user) {
      navigate(user.role === 'customer' ? '/customer/dashboard' : '/mechanic/dashboard', {
        replace: true,
      })
    }
  }, [token, user, navigate])

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">VSMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-600/08 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Vehicle Service Management System
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight text-balance">
            Your car deserves{' '}
            <span className="gradient-text">the best care.</span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 text-balance">
            Book services, track repairs, pay invoices, and review complete service history — all
            in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                Start for Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-10">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="glass-card p-5 flex flex-col gap-3 hover:border-brand-500/20 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/70">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-10">Everything you need</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass-card p-6 flex gap-4 hover:border-white/[0.14] transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/50">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto glass-card p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-white/50 mb-8">
            Create a free account and book your first service in minutes.
          </p>
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-6 text-center text-sm text-white/30">
        © {new Date().getFullYear()} VSMS — Vehicle Service Management System
      </footer>
    </div>
  )
}
