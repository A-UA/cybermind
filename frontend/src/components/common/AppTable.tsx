import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { RefreshCw, Inbox } from 'lucide-react'

export interface AppTableColumn<T> {
  title: string                                             // 表头标题
  key: string | number                                      // 唯一标识
  render?: (row: T, index: number) => React.ReactNode      // 自定义渲染函数
  width?: string                                            // 列宽度
  className?: string                                        // 自定义样式类
}

interface AppTableProps<T> {
  columns: AppTableColumn<T>[]                              // 列配置
  data: T[]                                                 // 数据源
  isLoading?: boolean                                       // 是否处于加载中状态
  total?: number                                            // 总行数 (用于分页)
  page?: number                                             // 当前页码 (用于分页)
  pageSize?: number                                         // 每页容量
  onPageChange?: (page: number) => void                     // 页码变更回调
  emptyText?: string                                        // 无数据时提示文案
}

export function AppTable<T>({
  columns,
  data,
  isLoading = false,
  total = 0,
  page = 1,
  pageSize = 15,
  onPageChange,
  emptyText = '暂无相关数据记录'
}: AppTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-5 font-sans text-xs">
      {/* 表格容器 - 新野兽派实体硬阴影 */}
      <div className="border-2 border-border bg-card pop-shadow rounded-xl overflow-x-auto">
        {isLoading ? (
          /* 骨架屏 Loading */
          <div className="h-64 flex flex-col justify-center items-center space-y-3 bg-card">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-semibold">正在同步云端数据资源...</span>
          </div>
        ) : data.length === 0 ? (
          /* 无数据 Empty */
          <div className="h-64 flex flex-col justify-center items-center text-center space-y-3 bg-card">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground font-semibold">{emptyText}</span>
          </div>
        ) : (
          /* 真实数据 Table */
          <Table className="text-xs">
            <TableHeader className="bg-accent border-b-2 border-border">
              <TableRow className="border-b-2 border-border hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    style={{ width: col.width }}
                    className={`font-bold text-foreground select-none ${col.className || ''}`}
                  >
                    {col.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow
                  key={(row as any)?.id ?? rowIndex}
                  className="border-b-2 border-border last:border-b-0 hover:bg-secondary/40"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row, rowIndex) : (row as any)[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 分页器 - Neo-Brutalist 物理按压翻页组件 */}
      {!isLoading && onPageChange && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border-2 border-border pop-shadow p-4 rounded-xl text-xs font-semibold">
          <span className="text-muted-foreground select-none">
            第 <strong className="text-foreground">{page}</strong> 页 / 共 <strong className="text-foreground">{totalPages}</strong> 页（共 {total} 条记录）
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-xs pop-press disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none"
            >
              上一页 PREV
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-xs pop-press disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none"
            >
              下一页 NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppTable
