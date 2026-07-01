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
        'flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card rounded-lg border border-border p-4 shadow-sm text-[13px]',
        className,
      )}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-foreground truncate font-sans">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">
              {subtitle}
            </p>
          )}
        </div>
        {loading && (
          <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" strokeWidth={1.5} />
        )}
      </div>
      {(filters || actions) && (
        <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
          {filters}
          {actions}
        </div>
      )}
    </div>
  )
}
