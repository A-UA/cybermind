/** 认证状态管理 — Zustand */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types/api'

interface AuthState {
  accessToken: string | null
  user: UserInfo | null
  setAccessToken: (token: string) => void
  setUser: (user: UserInfo) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, user: null }),

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        // 超级管理员拥有所有权限
        if (user.roles.includes('super_admin')) return true
        return user.permissions.includes(permission)
      },
    }),
    {
      name: 'cybermind-auth',
    }
  )
)
