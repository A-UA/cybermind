import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import AppButton from '@/components/common/AppButton'
import { cn } from '@/lib/utils'

interface AppFormHeaderProps {
  title: ReactNode
  description?: ReactNode
  sticker?: ReactNode
  backTitle?: string
  onBack: () => void
}

export function AppFormHeader({
  title,
  description,
  sticker,
  backTitle = '返回',
  onBack,
}: AppFormHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
      <div className="flex items-center space-x-3 min-w-0">
        <AppButton
          type="button"
          variant="secondary"
          size="icon"
          onClick={onBack}
          title={backTitle}
        >
          <ArrowLeft className="h-4 w-4" />
        </AppButton>
        <div className="min-w-0">
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase truncate">
            {title}
          </h2>
          {description && (
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {sticker && (
        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3deg] hidden sm:inline-block">
          {sticker}
        </div>
      )}
    </div>
  )
}

export function AppFormCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <form
      className={cn(
        'bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs',
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
    <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
      <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
        {title}
      </h3>
      {children}
    </div>
  )
}
