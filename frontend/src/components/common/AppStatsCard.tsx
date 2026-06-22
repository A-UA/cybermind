import { cn } from '@/lib/utils'

interface AppStatsCardProps {
  title: string
  value: string | number
  label: string
  bgColorClass?: string
  statusColor?: string
}

export default function AppStatsCard({
  title,
  value,
  label,
  bgColorClass = 'bg-card',
  statusColor = 'bg-primary',
}: AppStatsCardProps) {
  return (
    <div
      className={cn(
        'border-2 border-border rounded-xl p-5 pop-shadow transition-all duration-300',
        bgColorClass,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-heading font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <span className={cn('w-2.5 h-2.5 rounded-full', statusColor)} />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-heading font-bold text-foreground">
          {value}
        </p>
        <p className="text-[10px] font-semibold text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}
