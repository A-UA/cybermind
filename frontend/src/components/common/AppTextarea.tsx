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
        'w-full px-4 py-2.5 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold placeholder-muted-foreground/60',
        resize === 'none' ? 'resize-none' : 'resize-y',
        className,
      )}
      {...props}
    />
  ),
)

AppTextarea.displayName = 'AppTextarea'

export default AppTextarea
