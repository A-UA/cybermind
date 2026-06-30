import { type ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface AppSelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

interface AppSelectProps {
  value: string
  onValueChange: (value: string | null) => void
  options: AppSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
  width?: 'sm' | 'md' | 'full'
}

const WIDTH_CLASS = {
  sm: 'w-28',
  md: 'w-44',
  full: 'w-full',
} as const

export default function AppSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  width = 'md',
}: AppSelectProps) {
  return (
    <Select items={options} value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'h-9 bg-background border border-border text-foreground text-[13px] rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/50',
          WIDTH_CLASS[width],
          className,
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn(
          'bg-card border border-border text-foreground rounded-xl text-[13px] elevation-3',
          contentClassName,
        )}
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
