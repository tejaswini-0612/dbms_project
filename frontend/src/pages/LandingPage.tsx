import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/store/authStore'

const capabilities = [
  {
    title: 'Vehicle records',
    description: 'Register every vehicle on one account and keep its details in one place.',
  },
  {
    title: 'Live request status',
    description: 'Follow a job from pending, through in progress, to completed.',
  },
  {
    title: 'Automatic invoicing',
    description: 'An invoice with tax is raised the moment a mechanic marks the job done.',
  },
  {
    title: 'Permanent history',
    description: 'Completed and closed jobs stay on record with their final amounts.',
  },
]

const steps = [
  'Open the customer portal and add your vehicles.',
  'Book a service, choosing the type and optionally a mechanic.',
  'Track the request while the workshop works through it.',
  'Settle the invoice once the job is complete.',
]

export default function LandingPage() {
  const user = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate(`/${user.role}/dashboard`, { replace: true })
  }, [user, navigate])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-ink-900/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-[0.2em] text-white">VSMS</span>
          <div className="flex items-center gap-2">
            <Link to="/signup">
              <Button variant="ghost" size="sm">
                Register
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Vehicle Service Management System</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.15] text-white sm:text-5xl">
            Service management,
            <br />
            <span className="text-accent-500">kept in order.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/50">
            Book workshop services, watch the job progress, and settle invoices — with every
            vehicle and every past service held in a single record.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline">
                Register Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="eyebrow">Capabilities</p>
          <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {capabilities.map(({ title, description }) => (
              <div key={title} className="bg-ink-800 p-6">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="eyebrow">How it works</p>
          <ol className="mt-7 divide-rows overflow-hidden rounded-lg border border-line">
            {steps.map((step, i) => (
              <li key={step} className="flex items-baseline gap-5 bg-ink-800 px-6 py-5">
                <span className="numeric text-xs text-accent-500">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-white/70">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} VSMS — Vehicle Service Management System
          </p>
        </div>
      </footer>
    </div>
  )
}
