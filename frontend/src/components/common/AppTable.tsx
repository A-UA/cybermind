import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { RefreshCw, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className="space-y-3 font-sans text-[13px]">
      {/* 表格容器 */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          /* 加载中 */
          <div className="h-64 flex flex-col justify-center items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" strokeWidth={1.5} />
            <span className="text-[13px] text-muted-foreground">正在加载数据...</span>
          </div>
        ) : data.length === 0 ? (
          /* 无数据 */
          <div className="h-64 flex flex-col justify-center items-center text-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Inbox className="h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <span className="text-[13px] text-muted-foreground">{emptyText}</span>
          </div>
        ) : (
          /* 数据表格 */
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent bg-muted/20">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    style={{ width: col.width }}
                    className={`text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none py-2.5 ${col.className || ''}`}
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
                  className="border-b border-border/40 last:border-b-0 hover:bg-accent/40 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={`py-3 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIndex) : (row as any)[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 分页器 */}
      {!isLoading && onPageChange && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-[13px]">
          <span className="text-muted-foreground font-mono text-[12px]">
            第 <span className="text-foreground font-semibold">{page}</span> / {totalPages} 页（{total} 条记录）
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-accent text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1 text-[12px] font-medium active:scale-[0.98]"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>上一页</span>
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-accent text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1 text-[12px] font-medium active:scale-[0.98]"
            >
              <span>下一页</span>
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppTable
