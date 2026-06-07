/**
 * AppModal — 全站统一新野兽派风格模态对话框底座
 * 所有表单弹窗、确认弹窗统一由此组件包裹，确保遮罩/层叠/动画/关闭行为一致。
 */
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/** 尺寸变体对照 */
const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
} as const

interface AppModalProps {
  /** 是否展示弹窗 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 弹窗标题文案 */
  title: string
  /** 弹窗尺寸 */
  size?: keyof typeof SIZE_MAP
  /** 顶部装饰贴纸文案（可选） */
  sticker?: string
  /** 是否显示底部关闭按钮 */
  showFooterClose?: boolean
  /** 子内容插槽 */
  children: ReactNode
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  sticker,
  children,
}: AppModalProps) {
  // 弹窗打开时锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* 遮罩层 — 点击关闭 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 弹窗主体 */}
      <div
        className={`relative bg-card border-4 border-border rounded-xl pop-shadow-lg ${SIZE_MAP[size]} w-full overflow-hidden flex flex-col animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部头 */}
        <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between flex-shrink-0 relative">
          {/* 装饰贴纸 */}
          {sticker && (
            <div className="absolute -top-3 -right-1 px-2.5 py-0.5 bg-primary text-primary-foreground border-2 border-border text-[9px] font-heading font-bold uppercase rounded-lg rotate-[4deg] pop-shadow-sm select-none z-10">
              {sticker}
            </div>
          )}
          <h3 className="font-heading font-bold text-sm text-foreground truncate pr-8">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer flex-shrink-0 transition-colors"
            aria-label="关闭弹窗"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 内容插槽 */}
        <div className="flex-1 overflow-y-auto text-xs font-sans text-foreground">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
