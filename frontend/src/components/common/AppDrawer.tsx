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

interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
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
  className,
  contentClassName,
}: AppDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          'sm:max-w-md border-2 border-border bg-card',
          contentClassName,
        )}
      >
        <SheetHeader className={cn('border-b-2 border-border pb-4', className)}>
          <SheetTitle className="text-sm font-heading font-bold tracking-wider uppercase">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-[10px] font-semibold text-muted-foreground">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 text-xs">{children}</div>
        {footer && (
          <SheetFooter className="border-t-2 border-border pt-4">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
