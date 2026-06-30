import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function AppDarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center border-2 border-border rounded-lg bg-background p-0.5 pop-shadow-sm select-none">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          mounted && theme === 'light'
            ? 'bg-primary text-primary-foreground font-bold'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="亮色模式"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          mounted && theme === 'dark'
            ? 'bg-primary text-primary-foreground font-bold'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="暗色模式"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          mounted && theme === 'system'
            ? 'bg-primary text-primary-foreground font-bold'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="跟随系统"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
