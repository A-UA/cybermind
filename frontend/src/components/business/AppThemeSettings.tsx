/**
 * AppThemeSettings — 极简科技黑亮/暗/跟随系统主题切换组件
 */
import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function AppThemeSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 点击外部自动关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) return null

  const modes = [
    { key: 'light', icon: Sun, label: 'LIGHT' },
    { key: 'dark', icon: Moon, label: 'DARK' },
    { key: 'system', icon: Monitor, label: 'SYSTEM' },
  ] as const

  // 获取当前模式图标
  const CurrentIcon = modes.find(m => m.key === theme)?.icon || Monitor

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-md"
        title="主题设置"
      >
        <CurrentIcon className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-lg elevation-2 z-50 animate-scale-in p-1 font-sans">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = theme === mode.key
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => {
                  setTheme(mode.key)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
