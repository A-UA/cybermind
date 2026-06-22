/**
 * AppButton — 全站统一新野兽派风格按钮
 * 自动管理 loading 旋转动画与 disabled 遮罩行为。
 */
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 按钮尺寸样式对照 */
const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-[10px]',
  default: 'px-5 py-2 text-xs',
  lg: 'px-8 py-3 text-xs',
  icon: 'h-9 w-9 p-0',
  iconSm: 'h-7 w-7 p-0',
} as const

/** 按钮变体样式对照 */
const VARIANT_MAP = {
  primary:
    'bg-primary text-primary-foreground border-2 border-border pop-shadow-sm pop-press',
  secondary:
    'bg-background text-foreground border-2 border-border hover:bg-accent pop-shadow-sm pop-press',
  danger:
    'bg-destructive text-destructive-foreground border-2 border-border pop-shadow-sm pop-press',
  accent:
    'bg-accent text-foreground border-2 border-border pop-shadow-sm pop-press',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground border-2 border-border',
  success:
    'bg-emerald-400 text-black border-2 border-border pop-shadow-sm pop-press',
  warning:
    'bg-amber-400 text-black border-2 border-border pop-shadow-sm pop-press',
} as const

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 是否处于加载中 */
  loading?: boolean
  /** 加载时的文案 */
  loadingText?: string
  /** 按钮变体 */
  variant?: keyof typeof VARIANT_MAP
  /** 按钮尺寸 */
  size?: keyof typeof SIZE_MAP
  /** 按钮左侧图标插槽 */
  icon?: ReactNode
}

export default function AppButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'default',
  icon,
  children,
  className,
  disabled,
  ...rest
}: AppButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'font-heading font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5',
        SIZE_MAP[size],
        VARIANT_MAP[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{loading ? (loadingText ?? children) : children}</span>
    </button>
  )
}
