import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell({ role }: { role: 'customer' | 'mechanic' }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
