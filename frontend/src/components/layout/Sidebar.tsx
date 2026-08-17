import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Car,
  CalendarPlus,
  ClipboardList,
  History,
  LogOut,
  Wrench,
  Briefcase,
} from 'lucide-react'

const customerNav = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/vehicles', icon: Car, label: 'My Vehicles' },
  { to: '/customer/book', icon: CalendarPlus, label: 'Book Service' },
  { to: '/customer/requests', icon: ClipboardList, label: 'My Requests' },
  { to: '/customer/history', icon: History, label: 'Service History' },
]

const mechanicNav = [
  { to: '/mechanic/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mechanic/jobs', icon: Briefcase, label: 'My Jobs' },
]

interface SidebarProps {
  role: 'customer' | 'mechanic'
}

export function Sidebar({ role }: SidebarProps) {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const navItems = role === 'customer' ? customerNav : mechanicNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-white/[0.02]">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">VSMS</p>
            <p className="text-[10px] text-white/40 mt-0.5">
              {role === 'customer' ? 'Customer Portal' : 'Mechanic Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.04]">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? '—'}</p>
            <p className="text-xs text-white/40 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('nav-item', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
