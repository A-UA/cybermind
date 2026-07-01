/**
 * AppButton — 全站统一 V2 极简科技黑风格按钮
 * 自动管理 loading 旋转动画与 disabled 遮罩行为。
 */
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 按钮尺寸样式对照 */
const SIZE_MAP = {
  sm: 'px-2.5 py-1.5 text-[11px] h-7',
  default: 'px-3.5 py-2 text-[13px] h-9',
  lg: 'px-5 py-2.5 text-[14px] h-11',
  icon: 'h-9 w-9 p-0',
  iconSm: 'h-7 w-7 p-0',
} as const

/** 按钮变体样式对照 */
const VARIANT_MAP = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border border-primary/20 shadow-sm',
  secondary:
    'bg-card text-foreground border border-border hover:bg-accent transition-colors shadow-sm',
  danger:
    'bg-destructive text-white hover:bg-destructive/95 transition-colors border border-destructive/20 shadow-sm',
  accent:
    'bg-accent text-foreground hover:bg-accent/80 border border-border transition-colors',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 transition-colors border border-emerald-600/20 shadow-sm',
  warning:
    'bg-amber-500 text-white hover:bg-amber-600 transition-colors border border-amber-600/20 shadow-sm',
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
        'font-sans font-medium rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 select-none active:scale-[0.98]',
        SIZE_MAP[size],
        VARIANT_MAP[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{loading ? (loadingText ?? children) : children}</span>}
    </button>
  )
}
