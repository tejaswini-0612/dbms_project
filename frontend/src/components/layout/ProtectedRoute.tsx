import { Navigate } from 'react-router-dom'
import { useSession } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  role: 'customer' | 'mechanic'
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const user = useSession()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />

  return <>{children}</>
}
