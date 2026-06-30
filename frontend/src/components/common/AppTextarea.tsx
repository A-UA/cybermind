import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: 'none' | 'vertical'
}

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ className, resize = 'none', ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground outline-none text-[13px] placeholder-muted-foreground/60 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
        resize === 'none' ? 'resize-none' : 'resize-y',
        className,
      )}
      {...props}
    />
  ),
)

AppTextarea.displayName = 'AppTextarea'

export default AppTextarea
