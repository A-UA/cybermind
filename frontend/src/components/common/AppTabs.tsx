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
        'inline-flex items-center bg-background border-2 border-border rounded-xl p-1 gap-1',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            'px-4 py-2 text-xs font-heading font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5',
            value === option.value
              ? 'bg-primary text-primary-foreground pop-shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
