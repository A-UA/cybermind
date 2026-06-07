import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth'

export interface AppProtectedRouteProps {
  permission?: string
}

export const AppProtectedRoute = ({ permission }: AppProtectedRouteProps) => {
  const { accessToken, hasPermission } = useAuthStore()

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
