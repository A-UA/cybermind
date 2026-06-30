/**
 * AppThemeSettings — 简化后的亮/暗/跟随系统主题切换组件
 * 移除了色彩方案选择面板（原 3 套赛博主题已废弃）
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
    { key: 'light', icon: Sun, label: '亮色' },
    { key: 'dark', icon: Moon, label: '暗色' },
    { key: 'system', icon: Monitor, label: '跟随' },
  ] as const

  // 获取当前模式图标
  const CurrentIcon = modes.find(m => m.key === theme)?.icon || Monitor

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center rounded-lg"
        title="主题设置"
      >
        <CurrentIcon className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-xl elevation-3 z-50 animate-scale-in p-1.5">
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
