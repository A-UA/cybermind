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
        'w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground outline-none text-[13px] placeholder-muted-foreground/60 transition-all focus:border-primary/80 focus:ring-1 focus:ring-primary/80 font-sans',
        resize === 'none' ? 'resize-none' : 'resize-y',
        className,
      )}
      {...props}
    />
  ),
)

AppTextarea.displayName = 'AppTextarea'

export default AppTextarea
