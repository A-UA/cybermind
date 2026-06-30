import { type ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// 定义统一的抽屉宽度规范
const SIZE_MAP = {
  sm: 'data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
  md: 'data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md',
  lg: 'data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-lg data-[side=right]:sm:max-w-lg',
  xl: 'data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-xl data-[side=right]:sm:max-w-xl',
  full: 'data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-4xl data-[side=right]:sm:max-w-4xl',
} as const

interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  size?: keyof typeof SIZE_MAP
  showCloseButton?: boolean
  className?: string
  contentClassName?: string
}

export default function AppDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  showCloseButton = true,
  className,
  contentClassName,
}: AppDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={side}
        showCloseButton={showCloseButton}
        className={cn(
          'flex flex-col h-full bg-card p-0 gap-0 outline-none elevation-4 border-l border-border',
          SIZE_MAP[size],
          contentClassName,
        )}
      >
        {/* 顶部头部 */}
        <SheetHeader className={cn('flex flex-col gap-1 border-b border-border p-5 flex-shrink-0', className)}>
          <SheetTitle className="text-base font-heading text-foreground">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-[12px] text-muted-foreground mt-0.5">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* 中间内容滚动区 */}
        <div className="flex-1 overflow-y-auto p-6 text-[13px]">{children}</div>

        {/* 底部操作区 */}
        {footer && (
          <SheetFooter className="mt-auto border-t border-border p-4 flex-shrink-0">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
