import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  inputClassName?: string
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ leftIcon, rightIcon, className, inputClassName, ...props }, ref) => {
    const inputStyles = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground outline-none text-[13px] placeholder-muted-foreground/60 transition-all focus:border-primary/80 focus:ring-1 focus:ring-primary/80 h-9 font-sans'

    if (leftIcon || rightIcon) {
      return (
        <div className={cn('relative flex items-center', className)}>
          {leftIcon && <span className="absolute left-3 text-muted-foreground/80">{leftIcon}</span>}
          <input
            ref={ref}
            className={cn(
              inputStyles,
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              inputClassName,
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 text-muted-foreground/80">{rightIcon}</span>}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(inputStyles, className, inputClassName)}
        {...props}
      />
    )
  },
)

AppInput.displayName = 'AppInput'

export default AppInput
