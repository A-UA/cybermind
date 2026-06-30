import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppStatusTone = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info'

const TONE_CLASS: Record<AppStatusTone, string> = {
  default: 'bg-secondary text-foreground',
  success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400',
  muted: 'bg-muted text-muted-foreground',
  info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
}

const DOT_COLOR: Record<AppStatusTone, string> = {
  default: 'bg-foreground/40',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  muted: 'bg-muted-foreground/40',
  info: 'bg-blue-500',
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
        'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full select-none whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLOR[tone])} />
      )}
      {children}
    </span>
  )
}
