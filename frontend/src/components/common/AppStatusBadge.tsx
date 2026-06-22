import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppStatusTone = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info'

const TONE_CLASS: Record<AppStatusTone, string> = {
  default: 'bg-background text-foreground',
  success: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400',
  warning: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400',
  danger: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  muted: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
  info: 'bg-[#E8F4FD] dark:bg-slate-800 text-foreground',
}

interface AppStatusBadgeProps {
  children: ReactNode
  tone?: AppStatusTone
  className?: string
  dot?: boolean
}

export default function AppStatusBadge({
  children,
  tone = 'default',
  className,
  dot = false,
}: AppStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 border-2 border-border text-[10px] font-bold rounded-lg pop-shadow-sm select-none whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            tone === 'success'
              ? 'bg-emerald-400'
              : tone === 'warning'
                ? 'bg-amber-400'
                : 'bg-muted-foreground/40',
          )}
        />
      )}
      {children}
    </span>
  )
}
