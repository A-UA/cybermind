import { Plus, Trash2, Edit, RefreshCw, HelpCircle } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppGuard from '@/components/common/AppGuard'
import AppButton from '@/components/common/AppButton'
import AppInput from '@/components/common/AppInput'
import AppToolbar from '@/components/common/AppToolbar'
import AppStatusBadge from '@/components/common/AppStatusBadge'
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
        <span className="font-mono text-muted-foreground">
          #{row.id}
        </span>
      )
    },
    {
      title: '常见问题',
      key: 'question',
      render: (row) => (
        <span className="font-medium text-foreground truncate max-w-sm block" title={row.question}>
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
          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[11px] font-medium rounded-full select-none">
            {cat ? cat.name : '未分类'}
          </span>
        )
      }
    },
    {
      title: '排序',
      key: 'sort_order',
      width: '80px',
      className: 'text-center font-mono text-muted-foreground',
      render: (row) => row.sort_order
    },
    {
      title: '分发状态',
      key: 'is_active',
      width: '110px',
      className: 'text-center',
      render: (row) => (
        <AppStatusBadge tone={row.is_active ? 'success' : 'muted'} dot>
          {row.is_active ? '分发中' : '已下线'}
        </AppStatusBadge>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: '160px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <AppGuard permission="help:update">
            <AppButton
              onClick={() => onEditQuestion(row)}
              size="iconSm"
              variant="secondary"
              title="编辑问答"
            >
              <Edit className="h-3.5 w-3.5" strokeWidth={1.75} />
            </AppButton>

            {row.is_active ? (
              <AppButton
                onClick={() => onToggleActive(row.id, false)}
                size="sm"
                variant="warning"
                title="下线"
              >
                下线
              </AppButton>
            ) : (
              <AppButton
                onClick={() => onToggleActive(row.id, true)}
                size="sm"
                variant="success"
                title="启用"
              >
                启用
              </AppButton>
            )}
          </AppGuard>

          <AppGuard permission="help:delete">
            <AppButton
              onClick={() => onDeleteQuestion(row.id)}
              size="iconSm"
              variant="ghost"
              className="hover:text-destructive hover:bg-destructive/10"
              title="删除问答"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </AppButton>
          </AppGuard>
        </div>
      )
    }
  ]

  return (
    <div className="xl:col-span-3 space-y-6 text-xs">
      <AppToolbar
        icon={<HelpCircle className="h-5 w-5 text-primary" strokeWidth={1.75} />}
        title="常见问题与解答管理"
        loading={isLoading}
        filters={
          <AppInput
            type="text"
            placeholder="搜索常见问题..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-48"
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              onClick={onRefetch}
              size="icon"
              variant="secondary"
              title="刷新数据"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            </AppButton>

            <AppGuard permission="help:create">
              <AppButton
                onClick={onCreateQuestion}
                icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
              >
                新增问答
              </AppButton>
            </AppGuard>
          </div>
        }
      />

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
