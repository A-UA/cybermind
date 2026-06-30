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
        'flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card rounded-2xl elevation-1 p-5 transition-all duration-200 text-[13px]',
        className,
      )}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <h2 className="text-base font-heading text-foreground truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {loading && (
          <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" strokeWidth={1.75} />
        )}
      </div>
      {(filters || actions) && (
        <div className="flex flex-wrap items-center gap-3 text-[13px]">
          {filters}
          {actions}
        </div>
      )}
    </div>
  )
}
