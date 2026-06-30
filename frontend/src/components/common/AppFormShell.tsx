import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import AppButton from '@/components/common/AppButton'
import { cn } from '@/lib/utils'

interface AppFormHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** @deprecated sticker 参数已废弃 */
  sticker?: ReactNode
  backTitle?: string
  onBack: () => void
}

export function AppFormHeader({
  title,
  description,
  backTitle = '返回',
  onBack,
}: AppFormHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-card rounded-2xl elevation-1 p-5 transition-all duration-200">
      <div className="flex items-center space-x-3 min-w-0">
        <AppButton
          type="button"
          variant="secondary"
          size="icon"
          onClick={onBack}
          title={backTitle}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </AppButton>
        <div className="min-w-0">
          <h2 className="text-base font-heading text-foreground truncate">
            {title}
          </h2>
          {description && (
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AppFormCard({
  children,
  className,
  onSubmit,
}: {
  children: ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'bg-card rounded-2xl p-8 elevation-2 space-y-6 text-[13px]',
        className,
      )}
    >
      {children}
    </form>
  )
}

export function AppFormMetaPanel({
  title,
  children,
}: {
  title: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-5 bg-card p-6 rounded-2xl elevation-1 h-fit">
      <h3 className="text-[13px] font-semibold text-foreground border-b border-border pb-3 select-none">
        {title}
      </h3>
      {children}
    </div>
  )
}
