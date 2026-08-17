import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  role: 'customer' | 'mechanic'
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const currentRole = useAuthStore((s) => s.role)

  if (!currentRole) {
    return <Navigate to="/login" replace />
  }

  if (currentRole !== role) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
