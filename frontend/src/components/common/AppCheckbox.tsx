/**
 * AppCheckbox — 全站统一复选框组件
 * Atelier 风格：细边框 + 柔和过渡
 */
import { type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface AppCheckboxProps {
  /** 选中状态 */
  checked: boolean
  /** 选中状态变更回调（布尔值，非 DOM 事件） */
  onCheckedChange: (checked: boolean) => void
  /** 主标签文本 */
  label?: ReactNode
  /** 副标题（如角色 code、权限 code） */
  description?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸变体 */
  size?: 'sm' | 'default'
  /** 外层容器扩展样式 */
  className?: string
}

export default function AppCheckbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size = 'default',
  className,
}: AppCheckboxProps) {
  // 仅复选框（无标签/副标题）的极简模式
  if (!label && !description) {
    return (
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'border border-border rounded-md data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground transition-colors',
          size === 'sm' && 'size-3.5',
          className,
        )}
      />
    )
  }

  // 有副标题时采用垂直堆叠布局
  if (description) {
    return (
      <label
        className={cn(
          'flex items-start space-x-2.5 px-3 py-2.5 border border-border rounded-xl bg-background cursor-pointer select-none transition-all duration-200 hover:bg-accent/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            'mt-0.5 border border-border flex-shrink-0 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground transition-colors',
            size === 'sm' && 'size-3.5',
          )}
        />
        <div className="min-w-0">
          {label && (
            <p className="font-medium text-foreground text-[13px]">{label}</p>
          )}
          <p className="text-[11px] text-muted-foreground font-mono leading-tight mt-0.5">
            {description}
          </p>
        </div>
      </label>
    )
  }

  // 默认水平行内布局（仅有 label）
  return (
    <label
      className={cn(
        'flex items-center space-x-2.5 cursor-pointer select-none transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'border border-border data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground transition-colors',
          size === 'sm' && 'size-3.5',
        )}
      />
      {label && (
        <span className="text-[13px] font-medium text-foreground">{label}</span>
      )}
    </label>
  )
}
