/**
 * AppStatsCard — 统计指标卡片
 * V2 极简科技黑风格：精密单像素边框 + 细色块指示器
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
    <div className="relative bg-card border border-border rounded-lg shadow-sm p-4 overflow-hidden group select-none">
      {/* 左侧精密单像素指示条 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ backgroundColor: accentColor || 'var(--primary)' }}
      />

      <div className="flex items-start justify-between pl-2">
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {label && (
            <p className="text-[11px] text-muted-foreground">{label}</p>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
