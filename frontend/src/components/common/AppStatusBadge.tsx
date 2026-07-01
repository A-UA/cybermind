import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppStatusTone = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info'

const TONE_CLASS: Record<AppStatusTone, string> = {
  default: 'bg-secondary text-foreground border border-border/40',
  success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15',
  warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/15',
  danger: 'bg-red-500/10 text-red-500 border border-red-500/15',
  muted: 'bg-muted text-muted-foreground border border-border/40',
  info: 'bg-primary/10 text-primary border border-primary/15',
}

const DOT_COLOR: Record<AppStatusTone, string> = {
  default: 'bg-foreground/40',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  muted: 'bg-muted-foreground/40',
  info: 'bg-primary',
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
        'inline-flex items-center justify-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded select-none whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLOR[tone])} />
      )}
      <span className="leading-none">{children}</span>
    </span>
  )
}
