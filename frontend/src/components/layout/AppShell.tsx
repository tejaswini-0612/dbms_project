import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  role: 'customer' | 'mechanic'
}

export function AppShell({ role }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
