import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth'

export interface ProtectedRouteProps {
  permission?: string
}

export const ProtectedRoute = ({ permission }: ProtectedRouteProps) => {
  const { accessToken, hasPermission } = useAuthStore()

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
