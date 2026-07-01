/**
 * AppModal - 全站统一弹窗组件
 * V2 极简风格：锐利圆角 + 细分割线 + 极轻阴影
 */
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'

import { Dialog, DialogPortal } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
} as const

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: keyof typeof SIZE_MAP
  /** @deprecated sticker 参数已废弃，不再使用 */
  sticker?: string
  children: ReactNode
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}: AppModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          onClick={onClose}
        />

        <DialogPrimitive.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-98 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98',
            SIZE_MAP[size],
          )}
        >
          <div
            className="relative w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex w-full flex-col overflow-hidden rounded-lg bg-card border border-border elevation-3 animate-scale-in">
              {/* 标题栏 */}
              <div className="relative flex flex-shrink-0 items-center justify-between border-b border-border px-5 py-3.5">
                <DialogPrimitive.Title className="truncate pr-8 font-sans font-semibold text-[14px] text-foreground">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  render={
                    <button
                      type="button"
                      className="flex-shrink-0 cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label="关闭弹窗"
                    />
                  }
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                  <span className="sr-only">关闭弹窗</span>
                </DialogPrimitive.Close>
              </div>

              {/* 内容区 */}
              <div className="flex-1 overflow-y-auto font-sans text-[13px] text-foreground">
                {children}
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
