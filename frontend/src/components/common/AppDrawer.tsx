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
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-4xl',
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
  className?: string         // 覆盖 Header 的 className
  contentClassName?: string  // 覆盖 SheetContent 的 className
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
          // gap-0 可以让页头、内容区和页脚紧密贴合，符合 neo-brutalism 的分块边框设计
          'flex flex-col h-full border-l-4 border-border bg-card p-0 gap-0 outline-none shadow-lg',
          SIZE_MAP[size],
          contentClassName,
        )}
      >
        {/* 顶部头部：内置统一的背景色 (bg-accent/40) 与强边框分割线 */}
        <SheetHeader className={cn('flex flex-col gap-1 border-b-2 border-border bg-accent/40 p-5 flex-shrink-0', className)}>
          <SheetTitle className="text-sm font-heading font-bold tracking-wider uppercase text-foreground">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* 中间内容滚动区：统一的 p-6 间距与基础字号 */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">{children}</div>

        {/* 底部操作区：内置边框分割线与底色 */}
        {footer && (
          <SheetFooter className="mt-auto border-t-2 border-border bg-accent/20 p-4 flex-shrink-0">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
