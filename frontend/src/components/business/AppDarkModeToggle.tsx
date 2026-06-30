import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

const NEXT_THEME_MAP = {
  light: 'dark',
  dark: 'system',
  system: 'light',
} as const

const TITLE_MAP = {
  light: '当前：亮色模式 // 点击切换为暗色',
  dark: '当前：暗色模式 // 点击切换为跟随系统',
  system: '当前：跟随系统 // 点击切换为亮色',
} as const

export default function AppDarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 border-2 border-border rounded-lg bg-background flex items-center justify-center pop-shadow-sm opacity-50" />
    )
  }

  // 获取当前主题设置（兜底为 system）
  const currentTheme = (theme as keyof typeof NEXT_THEME_MAP) || 'system'
  const nextTheme = NEXT_THEME_MAP[currentTheme]

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 检查浏览器是否支持 View Transitions API
    const isAppearanceTransition =
      typeof document !== 'undefined' &&
      // @ts-ignore
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      setTheme(nextTheme)
      return
    }

    // @ts-ignore
    document.startViewTransition(() => {
      setTheme(nextTheme)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="w-9 h-9 border-2 border-border bg-card hover:bg-accent text-foreground transition-all pop-shadow-sm pop-press cursor-pointer flex items-center justify-center rounded-lg"
      title={TITLE_MAP[currentTheme]}
    >
      {currentTheme === 'light' && <Sun key="light" className="h-4 w-4 text-amber-500 animate-icon-in" />}
      {currentTheme === 'dark' && <Moon key="dark" className="h-4 w-4 text-violet-400 animate-icon-in" />}
      {currentTheme === 'system' && <Monitor key="system" className="h-4 w-4 text-primary animate-icon-in" />}
    </button>
  )
}
