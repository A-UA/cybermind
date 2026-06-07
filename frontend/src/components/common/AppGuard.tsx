import React from 'react'
import { useAuthStore } from '@/stores/auth'

interface AppGuardProps {
  permission: string         // 校验所需的权限标识 (如 "banner:delete")
  fallback?: React.ReactNode // 鉴权失败时的替代占位渲染，默认为 null
  children: React.ReactNode  // 鉴权成功时展示的组件内容
}

export function AppGuard({
  permission,
  fallback = null,
  children
}: AppGuardProps) {
  const { hasPermission } = useAuthStore()

  // 校验当前登录用户是否拥有对应的权限
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default AppGuard
