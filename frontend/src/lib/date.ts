import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 启用相对时间插件并加载中文包
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期时间
 * @param date 原始日期（ISO字符串、Date对象或时间戳）
 * @param format 格式化字符串，默认：'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(
  date: string | Date | number | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.format(format) : '-'
}

/**
 * 将时间转换成友好的相对时间提示 (例如: 3 分钟前, 2 天前)
 * @param date 原始日期
 */
export function formatFromNow(date: string | Date | number | null | undefined): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.fromNow() : '-'
}
