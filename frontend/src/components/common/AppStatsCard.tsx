/**
 * AppStatsCard — 统计指标卡片
 * Atelier 风格：白色卡片 + 左侧色条 + 柔和阴影
 */

interface AppStatsCardProps {
  title: string
  value: string | number
  label?: string
  icon?: React.ReactNode
  accentColor?: string  // 左侧色条颜色，默认 primary
}

export default function AppStatsCard({
  title,
  value,
  label,
  icon,
  accentColor,
}: AppStatsCardProps) {
  return (
    <div className="relative bg-card rounded-2xl elevation-1 hover:elevation-2 transition-shadow p-5 overflow-hidden group">
      {/* 左侧色条装饰 */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: accentColor || 'var(--primary)' }}
      />

      <div className="flex items-start justify-between pl-3">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-heading text-foreground tracking-tight">
            {value}
          </p>
          {label && (
            <p className="text-[12px] text-muted-foreground">{label}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
