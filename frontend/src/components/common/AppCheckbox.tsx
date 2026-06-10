/**
 * AppCheckbox — 全站统一波普新野兽派复选框组件
 * 基于 shadcn/ui Checkbox (Base UI 原语) 封装，统一标签、副标题、按压动效。
 */
import { type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface AppCheckboxProps {
  /** 选中状态 */
  checked: boolean
  /** 选中状态变更回调（布尔值，非 DOM 事件） */
  onCheckedChange: (checked: boolean) => void
  /** 主标签文本（支持 ReactNode 以实现条件着色） */
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
          'border-2 border-border rounded-md data-checked:border-border data-checked:bg-primary data-checked:text-primary-foreground',
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
          'flex items-start space-x-2.5 px-3 py-2 border-2 border-border rounded-lg bg-background cursor-pointer select-none transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)',
          'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--border)]',
          'active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            'mt-0.5 border-2 border-border flex-shrink-0 data-checked:border-border data-checked:bg-primary data-checked:text-primary-foreground',
            size === 'sm' && 'size-3.5',
          )}
        />
        <div className="min-w-0">
          {label && (
            <p className="font-bold text-foreground text-xs">{label}</p>
          )}
          <p className="text-[10px] text-muted-foreground font-mono leading-tight">
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
        'inline-flex items-center space-x-2.5 cursor-pointer select-none transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)',
        'hover:translate-x-[1px] hover:translate-y-[1px]',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'border-2 border-border data-checked:border-border data-checked:bg-primary data-checked:text-primary-foreground',
          size === 'sm' && 'size-3.5',
        )}
      />
      {label && (
        <span className="text-xs font-bold text-foreground">{label}</span>
      )}
    </label>
  )
}
