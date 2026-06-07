import { Plus, Trash2, Edit, RefreshCw, HelpCircle } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppGuard from '@/components/common/AppGuard'
import type { IHelpQuestion, IHelpCategory } from '../types'

interface HelpQuestionListProps {
  questions: IHelpQuestion[]
  categories: IHelpCategory[]
  isLoading: boolean
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onRefetch: () => void
  onCreateQuestion: () => void
  onEditQuestion: (question: IHelpQuestion) => void
  onDeleteQuestion: (id: number) => void
  onToggleActive: (id: number, currentActive: boolean) => void
}

export default function HelpQuestionList({
  questions,
  categories,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  onRefetch,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onToggleActive
}: HelpQuestionListProps) {

  // 表格列定义
  const columns: AppTableColumn<IHelpQuestion>[] = [
    {
      title: 'ID',
      key: 'id',
      width: '70px',
      render: (row) => (
        <span className="font-bold text-muted-foreground/80 font-mono">
          #{row.id}
        </span>
      )
    },
    {
      title: '常见问题 Question',
      key: 'question',
      render: (row) => (
        <span className="font-bold text-foreground truncate max-w-sm block" title={row.question}>
          {row.question}
        </span>
      )
    },
    {
      title: '所属分类',
      key: 'category_id',
      width: '140px',
      render: (row) => {
        const cat = categories.find((c) => c.id === row.category_id)
        return (
          <span className="px-2 py-0.5 border-2 border-border bg-[#F5EEF8] dark:bg-slate-800 text-foreground text-[10px] font-bold rounded-lg pop-shadow-sm select-none">
            {cat ? cat.name : '未分类'}
          </span>
        )
      }
    },
    {
      title: '排序',
      key: 'sort_order',
      width: '80px',
      className: 'text-center font-bold text-muted-foreground font-mono',
      render: (row) => row.sort_order
    },
    {
      title: '分发状态',
      key: 'is_active',
      width: '110px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full inline-block border-2 border-border ${row.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/35'}`} />
          <span className={`text-[10px] font-bold ${row.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/60'}`}>
            {row.is_active ? '分发中' : '下线'}
          </span>
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: '160px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center space-x-1.5">
          <AppGuard permission="help:update">
            <button
              onClick={() => onEditQuestion(row)}
              className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
              title="编辑问答"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            
            {row.is_active ? (
              <button
                onClick={() => onToggleActive(row.id, false)}
                className="px-2 py-1.5 border-2 border-border bg-amber-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase"
                title="下架"
              >
                下线
              </button>
            ) : (
              <button
                onClick={() => onToggleActive(row.id, true)}
                className="px-2 py-1.5 border-2 border-border bg-emerald-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase"
                title="上架"
              >
                启用
              </button>
            )}
          </AppGuard>
          
          <AppGuard permission="help:delete">
            <button
              onClick={() => onDeleteQuestion(row.id)}
              className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-destructive transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
              title="删除问答"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </AppGuard>
        </div>
      )
    }
  ]

  return (
    <div className="xl:col-span-3 space-y-6 text-xs">
      {/* 操作过滤条 */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
            常见问题与解答管理
          </h2>
          {isLoading && (
            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* 问题关键字搜索 */}
          <input
            type="text"
            placeholder="搜索常见问题..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-48"
          />

          <button
            onClick={onRefetch}
            className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <AppGuard permission="help:create">
            <button
              onClick={onCreateQuestion}
              className="px-4 py-2 bg-primary text-primary-foreground font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>新增问答 ADD Q&A</span>
            </button>
          </AppGuard>
        </div>
      </div>

      {/* 表格数据层 */}
      <AppTable
        columns={columns}
        data={questions}
        isLoading={isLoading}
        emptyText="此分类下暂无问题解答记录"
      />
    </div>
  )
}
