import { create } from 'zustand'

export type ColorTheme = 'cyberpop' | 'cyberpunk' | 'mint'

interface ThemeState {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

export const useThemeStore = create<ThemeState>((set) => {
  // 获取初始值
  const getInitialTheme = (): ColorTheme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cybermind-color-theme')
      if (saved === 'cyberpop' || saved === 'cyberpunk' || saved === 'mint') {
        return saved
      }
    }
    return 'cyberpop'
  }

  const initialTheme = getInitialTheme()
  
  // 在初始化时立即写入 <html>，避免首屏样式闪烁
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', initialTheme)
  }

  return {
    colorTheme: initialTheme,
    setColorTheme: (theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cybermind-color-theme', theme)
        
        // 支持 View Transitions API，提供平滑全屏过渡
        // @ts-ignore
        if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          // @ts-ignore
          document.startViewTransition(() => {
            document.documentElement.setAttribute('data-theme', theme)
            set({ colorTheme: theme })
          })
        } else {
          document.documentElement.setAttribute('data-theme', theme)
          set({ colorTheme: theme })
        }
      } else {
        set({ colorTheme: theme })
      }
    },
  }
})
