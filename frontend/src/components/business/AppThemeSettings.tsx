import { useState, useRef, useEffect } from 'react'
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useThemeStore, type ColorTheme } from '@/stores/theme'

export default function AppThemeSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useThemeStore()
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

  // 对应主题的色块预览设置
  const themeList: { name: string; key: ColorTheme; primaryColor: string; bgColor: string }[] = [
    {
      name: 'CyberPop 波普',
      key: 'cyberpop',
      primaryColor: '#d946ef', // 霓虹桃红
      bgColor: '#fffdec',      // 温暖奶油黄
    },
    {
      name: 'Cyberpunk 赛博',
      key: 'cyberpunk',
      primaryColor: '#00e5ff', // 荧光天青
      bgColor: '#120320',      // 深邃霓虹紫
    },
    {
      name: 'Mint Fresh 薄荷',
      key: 'mint',
      primaryColor: '#3b8c6e', // 森林苍绿
      bgColor: '#f4fbf7',      // 雅致暖灰绿
    },
  ]

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 border-2 border-border bg-card hover:bg-accent text-foreground transition-all pop-shadow-sm pop-press cursor-pointer flex items-center justify-center rounded-lg"
        title="个性化主题设置 // THEME SETTINGS"
      >
        <Palette className="h-4 w-4 text-primary" />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-60 border-4 border-border bg-card p-4 rounded-xl pop-shadow-lg z-50 animate-scale-in flex flex-col space-y-4">
          {/* 选项组 1：暗/亮模式 */}
          <div className="space-y-2">
            <span className="text-[9px] font-heading font-black uppercase tracking-wider text-muted-foreground">
              模式切换 // SYSTEM MODE
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-1.5 border-2 border-border rounded-lg flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer pop-press ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>亮色</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-1.5 border-2 border-border rounded-lg flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer pop-press ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>暗色</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-1.5 border-2 border-border rounded-lg flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer pop-press ${
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>跟随</span>
              </button>
            </div>
          </div>

          <div className="border-t border-border/10 my-0.5" />

          {/* 选项组 2：主题颜色 */}
          <div className="space-y-2">
            <span className="text-[9px] font-heading font-black uppercase tracking-wider text-muted-foreground">
              色彩搭配 // COLOR PALETTE
            </span>
            <div className="flex flex-col space-y-2">
              {themeList.map((item) => {
                const isSelected = colorTheme === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setColorTheme(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 border-2 border-border rounded-lg text-xs font-bold transition-all cursor-pointer pop-press ${
                      isSelected
                        ? 'bg-accent/40 text-foreground pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                        : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {/* 预览色块 */}
                      <div className="flex -space-x-1 flex-shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border inline-block"
                          style={{ backgroundColor: item.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border inline-block"
                          style={{ backgroundColor: item.bgColor }}
                        />
                      </div>
                      <span className={isSelected ? 'text-foreground' : ''}>
                        {item.name}
                      </span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
