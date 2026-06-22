import { type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppToolbarProps {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  loading?: boolean
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function AppToolbar({
  icon,
  title,
  subtitle,
  loading = false,
  filters,
  actions,
  className,
}: AppToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300 text-xs',
        className,
      )}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {loading && (
          <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" />
        )}
      </div>
      {(filters || actions) && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {filters}
          {actions}
        </div>
      )}
    </div>
  )
}
