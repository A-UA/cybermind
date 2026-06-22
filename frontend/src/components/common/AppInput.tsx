import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  inputClassName?: string
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ leftIcon, rightIcon, className, inputClassName, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className={cn('relative flex items-center', className)}>
          {leftIcon && <span className="absolute left-3.5 text-muted-foreground">{leftIcon}</span>}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold placeholder-muted-foreground/60',
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
        className={cn(
          'w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold placeholder-muted-foreground/60',
          className,
          inputClassName,
        )}
        {...props}
      />
    )
  },
)

AppInput.displayName = 'AppInput'

export default AppInput
