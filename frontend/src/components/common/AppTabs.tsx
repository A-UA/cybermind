import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppTabsOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface AppTabsProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: AppTabsOption<T>[]
  className?: string
}

export default function AppTabs<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: AppTabsProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-muted/60 border border-border/40 rounded-lg p-1 gap-1',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            'px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 active:scale-[0.98] select-none',
            value === option.value
              ? 'bg-card text-foreground border border-border/50 shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
