/**
 * AppModal - 全站统一的弹窗包装层
 * 基于共享 Dialog 组件封装业务弹窗外观、尺寸和装饰贴纸。
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
  sticker?: string
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          onClick={onClose}
        />

        <DialogPrimitive.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            SIZE_MAP[size],
          )}
        >
          <div
            className="relative w-full"
            onClick={(event) => event.stopPropagation()}
          >
            {sticker && (
              <div className="absolute -top-3 -right-1 z-10 select-none rounded-lg border-2 border-border bg-primary px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase text-primary-foreground rotate-[4deg] pop-shadow-sm">
                {sticker}
              </div>
            )}

            <div className="relative flex w-full flex-col overflow-hidden rounded-xl border-4 border-border bg-card pop-shadow-lg animate-scale-in">
              <div className="relative flex flex-shrink-0 items-center justify-between rounded-t-xl border-b-4 border-border bg-accent p-4">
                <DialogPrimitive.Title className="truncate pr-8 font-heading text-sm font-bold text-foreground">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  render={
                    <button
                      type="button"
                      className="flex-shrink-0 cursor-pointer rounded-lg border-2 border-border bg-background p-1 transition-colors hover:bg-accent pop-shadow-sm"
                      aria-label="关闭弹窗"
                    />
                  }
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">关闭弹窗</span>
                </DialogPrimitive.Close>
              </div>

              <div className="flex-1 overflow-y-auto rounded-b-xl font-sans text-xs text-foreground">
                {children}
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
