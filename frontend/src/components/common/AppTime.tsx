import { formatDate, formatFromNow } from '@/lib/date'

interface AppTimeProps {
  value: string | Date | number | null | undefined
  format?: string
  relative?: boolean // 是否渲染为相对时间提示 (例如 "2小时前")
  className?: string
}

export function AppTime({ value, format, relative = false, className }: AppTimeProps) {
  if (!value) return <span className="text-muted-foreground">-</span>

  let isoString: string | undefined
  try {
    isoString = new Date(value).toISOString()
  } catch (e) {
    // 捕获可能的时间转换异常
    isoString = undefined
  }

  return (
    <time className={className} dateTime={isoString}>
      {relative ? formatFromNow(value) : formatDate(value, format)}
    </time>
  )
}
export default AppTime
