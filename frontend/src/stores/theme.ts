/**
 * Theme Store — 简化为仅管理暗/亮模式偏好
 * 多色方案（cyberpop / cyberpunk / mint）已移除，
 * 明暗切换完全由 next-themes 的 class 模式接管。
 * 该 store 保留是为了兼容可能的将来扩展（如密度偏好等）。
 */
import { create } from 'zustand'

export type ColorTheme = 'blue' | 'violet' | 'green' | 'orange' | 'red'

interface ThemeState {
  /** 侧边栏是否折叠（UI 偏好） */
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  /** 主题颜色偏好 */
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

export const useThemeStore = create<ThemeState>((set) => {
  const getInitialCollapsed = (): boolean => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cybermind-sidebar-collapsed')
      return saved === 'true'
    }
    return false
  }

  const getInitialColorTheme = (): ColorTheme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cybermind-color-theme') as ColorTheme
      if (['blue', 'violet', 'green', 'orange', 'red'].includes(saved)) {
        return saved
      }
    }
    return 'blue'
  }

  return {
    sidebarCollapsed: getInitialCollapsed(),
    setSidebarCollapsed: (collapsed) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cybermind-sidebar-collapsed', String(collapsed))
      }
      set({ sidebarCollapsed: collapsed })
    },
    colorTheme: getInitialColorTheme(),
    setColorTheme: (theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cybermind-color-theme', theme)
      }
      set({ colorTheme: theme })
    },
  }
})
