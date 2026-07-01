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
    <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4 shadow-sm">
      <div className="flex items-center space-x-3 min-w-0">
        <AppButton
          type="button"
          variant="secondary"
          size="iconSm"
          onClick={onBack}
          title={backTitle}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </AppButton>
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-foreground truncate font-sans">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">
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
        'bg-card rounded-lg border border-border p-6 space-y-6 text-[13px] shadow-sm',
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
    <div className="space-y-4 bg-card p-5 rounded-lg border border-border shadow-sm h-fit">
      <h3 className="text-[12px] font-semibold text-foreground border-b border-border pb-2.5 select-none font-sans">
        {title}
      </h3>
      {children}
    </div>
  )
}
