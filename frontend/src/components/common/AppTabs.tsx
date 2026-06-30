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
        'inline-flex items-center bg-muted/50 rounded-xl p-1 gap-0.5',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            'px-4 py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
            value === option.value
              ? 'bg-card text-foreground elevation-1 font-semibold'
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
