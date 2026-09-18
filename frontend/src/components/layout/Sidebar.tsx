import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useSession } from '@/store/authStore'
import { cn } from '@/utils/cn'

const customerNav = [
  { to: '/customer/dashboard', label: 'Overview' },
  { to: '/customer/vehicles', label: 'Vehicles' },
  { to: '/customer/book', label: 'Book a service' },
  { to: '/customer/requests', label: 'Requests' },
  { to: '/customer/history', label: 'History' },
]

const mechanicNav = [
  { to: '/mechanic/dashboard', label: 'Overview' },
  { to: '/mechanic/jobs', label: 'Jobs' },
]

export function Sidebar({ role }: { role: 'customer' | 'mechanic' }) {
  const logout = useAuthStore((s) => s.logout)
  const user = useSession()
  const navigate = useNavigate()
  const navItems = role === 'customer' ? customerNav : mechanicNav

  const leavePortal = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col border-r border-line bg-ink-800">
      <div className="border-b border-line px-5 py-5">
        <p className="text-sm font-semibold tracking-[0.2em] text-white">VSMS</p>
        <p className="eyebrow mt-1">
          {role === 'customer' ? 'Customer portal' : 'Workshop portal'}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="px-3 py-2">
          <p className="truncate text-sm text-white">{user?.name || '—'}</p>
          <p className="truncate text-xs text-white/35">{user?.email || ''}</p>
        </div>
        <button
          id="switch-portal"
          onClick={leavePortal}
          className="nav-item w-full text-white/45 hover:text-white"
        >
          Switch portal
        </button>
      </div>
    </aside>
  )
}
