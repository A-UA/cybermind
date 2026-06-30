/**
 * AppButton — 全站统一 Atelier 风格按钮
 * 自动管理 loading 旋转动画与 disabled 遮罩行为。
 */
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 按钮尺寸样式对照 */
const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-[11px]',
  default: 'px-4 py-2 text-[13px]',
  lg: 'px-6 py-2.5 text-sm',
  icon: 'h-9 w-9 p-0',
  iconSm: 'h-7 w-7 p-0',
} as const

/** 按钮变体样式对照 */
const VARIANT_MAP = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 elevation-1 hover:elevation-2 hover-lift',
  secondary:
    'bg-transparent text-foreground border border-border hover:bg-accent hover:border-border/80',
  danger:
    'bg-destructive text-white hover:bg-destructive/90 elevation-1 hover:elevation-2 hover-lift',
  accent:
    'bg-accent text-foreground hover:bg-accent/80 border border-border',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 elevation-1 hover:elevation-2 hover-lift',
  warning:
    'bg-amber-500 text-white hover:bg-amber-600 elevation-1 hover:elevation-2 hover-lift',
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
        'font-sans font-semibold rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5',
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
