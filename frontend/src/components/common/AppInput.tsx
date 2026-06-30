import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  inputClassName?: string
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ leftIcon, rightIcon, className, inputClassName, ...props }, ref) => {
    const inputStyles = 'w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground outline-none text-[13px] placeholder-muted-foreground/60 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10'

    if (leftIcon || rightIcon) {
      return (
        <div className={cn('relative flex items-center', className)}>
          {leftIcon && <span className="absolute left-3.5 text-muted-foreground">{leftIcon}</span>}
          <input
            ref={ref}
            className={cn(
              inputStyles,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              inputClassName,
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 text-muted-foreground">{rightIcon}</span>}
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
