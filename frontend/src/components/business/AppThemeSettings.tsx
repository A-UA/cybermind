/**
 * AppThemeSettings — 极简科技黑亮/暗/跟随系统及主题色切换组件
 */
import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useThemeStore, type ColorTheme } from '@/stores/theme'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function AppThemeSettings() {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const modes = [
    { key: 'light', icon: Sun, label: 'LIGHT' },
    { key: 'dark', icon: Moon, label: 'DARK' },
    { key: 'system', icon: Monitor, label: 'SYSTEM' },
  ] as const

  const colorThemes = [
    { key: 'blue', label: '极光蓝', colorClass: 'bg-blue-500' },
    { key: 'violet', label: '罗兰紫', colorClass: 'bg-violet-500' },
    { key: 'green', label: '极客绿', colorClass: 'bg-emerald-500' },
    { key: 'orange', label: '赛博橙', colorClass: 'bg-orange-500' },
    { key: 'red', label: '科技红', colorClass: 'bg-rose-500' },
  ] as const

  // 获取当前模式图标
  const CurrentIcon = modes.find(m => m.key === theme)?.icon || Monitor

  return (
    <DropdownMenu>
      {/* 触发按钮 — 悬浮时呈现当前选中的主题色 */}
      <DropdownMenuTrigger
        type="button"
        className="w-8 h-8 bg-transparent hover:bg-accent text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center rounded-md outline-none"
        title="主题设置"
      >
        <CurrentIcon className="h-4 w-4 transition-transform duration-250 hover:rotate-12" strokeWidth={1.5} />
      </DropdownMenuTrigger>

      {/* 下拉面板 */}
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 bg-card/95 backdrop-blur-md border border-border rounded-lg elevation-3 p-3 space-y-3 font-sans"
      >
        {/* 主题模式 */}
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block select-none">
            主题模式
          </span>
          <div className="grid grid-cols-3 gap-1">
            {modes.map((mode) => {
              const Icon = mode.icon
              const isActive = theme === mode.key
              return (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setTheme(mode.key)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] font-mono font-medium transition-all cursor-pointer border ${isActive
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5 mb-1" strokeWidth={1.5} />
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 主题色彩 */}
        <div>
          <div className="flex items-center justify-between mb-2 select-none">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              主题色彩
            </span>
            <span className="text-[9px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {colorThemes.find((c) => c.key === colorTheme)?.label || '极光蓝'}
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            {colorThemes.map((c) => {
              const isActive = colorTheme === c.key
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColorTheme(c.key as ColorTheme)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border cursor-pointer ${isActive
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 scale-110 shadow-sm'
                    : 'border-transparent hover:border-muted-foreground/30 hover:bg-accent'
                    }`}
                  title={c.label}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.colorClass} shadow-inner block`} />
                </button>
              )
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
