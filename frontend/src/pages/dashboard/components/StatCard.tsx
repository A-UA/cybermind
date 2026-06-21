interface StatCardProps {
  title: string
  value: string
  label: string
  bgColorClass?: string
  statusColor?: string
}

export default function StatCard({
  title,
  value,
  label,
  bgColorClass = 'bg-card',
  statusColor = 'bg-primary',
}: StatCardProps) {
  return (
    <div
      className={`p-6 ${bgColorClass} border-2 border-border rounded-xl pop-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)] transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between text-[11px] text-foreground font-heading tracking-wider uppercase font-bold">
        <span>{title}</span>
        <span className={`w-3 h-3 rounded-full border-2 border-border ${statusColor}`} />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-4xl font-heading font-bold tracking-tight text-foreground select-all">
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold tracking-wider font-mono">
          {label}
        </span>
      </div>
    </div>
  )
}
