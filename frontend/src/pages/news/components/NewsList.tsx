import AppSelect from '@/components/common/AppSelect'
import AppStatusBadge from '@/components/common/AppStatusBadge'
import AppButton from '@/components/common/AppButton'
import AppInput from '@/components/common/AppInput'
import AppToolbar from '@/components/common/AppToolbar'
import { Plus, Trash2, Edit, RefreshCw, Eye, Star, BookOpen } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppTime from '@/components/common/AppTime'
import AppGuard from '@/components/common/AppGuard'
import type { INewsArticle, INewsStats } from '../types'
import NewsStatsCards from './NewsStatsCards'

interface NewsListProps {
  articles: INewsArticle[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  isFetching: boolean
  stats?: INewsStats
  searchTitle: string
  onSearchTitleChange: (val: string) => void
  categoryFilter: string
  onCategoryFilterChange: (val: string) => void
  statusFilter: string
  onStatusFilterChange: (val: string) => void
  onRefetch: () => void
  onCreate: () => void
  onEdit: (article: INewsArticle) => void
  onDelete: (id: number) => void
  onToggleTop: (id: number, currentVal: boolean) => void
  onToggleStatus: (id: number, currentStatus: string) => void
}

const categoryOptions = [
  { value: 'all', label: '全部分类' },
  { value: 'industry', label: '行业动态' },
  { value: 'company', label: '企业新闻' },
  { value: 'product', label: '产品公告' },
]

const getColumns = (
  onToggleTop: (id: number, currentVal: boolean) => void,
  onEdit: (article: INewsArticle) => void,
  onToggleStatus: (id: number, currentStatus: string) => void,
  onDelete: (id: number) => void
): AppTableColumn<INewsArticle>[] => [
  {
    title: 'ID',
    key: 'id',
    width: '70px',
    render: (row) => <span className="font-mono text-muted-foreground">#{row.id}</span>
  },
  {
    title: '置顶',
    key: 'is_top',
    width: '80px',
    className: 'text-center',
    render: (row) => (
      <AppGuard permission="news:update">
        <AppButton
          onClick={() => onToggleTop(row.id, row.is_top)}
          size="iconSm"
          variant="secondary"
          className="border-none hover:bg-accent"
          title={row.is_top ? '取消置顶' : '置顶'}
        >
          <Star className={`h-4 w-4 ${row.is_top ? 'text-amber-500 fill-amber-400' : 'text-muted-foreground/60'}`} strokeWidth={1.5} />
        </AppButton>
      </AppGuard>
    )
  },
  {
    title: '封面图',
    key: 'cover_image',
    width: '100px',
    render: (row) => row.cover_image ? (
      <div className="w-16 h-10 border border-border bg-card rounded-lg overflow-hidden flex items-center justify-center p-0.5 relative group">
        <img src={row.cover_image} alt={row.title} className="max-w-full max-h-full object-contain rounded-md transition-transform duration-200 group-hover:scale-105" />
        <a href={row.cover_image} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
          <Eye className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
        </a>
      </div>
    ) : (
      <span className="text-[11px] text-muted-foreground/40 font-mono">--</span>
    )
  },
  {
    title: '标题',
    key: 'title',
    render: (row) => <span className="font-medium text-foreground truncate max-w-xs block" title={row.title}>{row.title}</span>
  },
  {
    title: '分类',
    key: 'category',
    width: '110px',
    render: (row) => (
      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[11px] font-medium rounded-full select-none">
        {categoryOptions.find((o) => o.value === row.category)?.label || '未分类'}
      </span>
    )
  },
  {
    title: '浏览量',
    key: 'view_count',
    width: '80px',
    className: 'text-center font-mono text-muted-foreground',
    render: (row) => row.view_count
  },
  {
    title: '状态',
    key: 'status',
    width: '90px',
    className: 'text-center',
    render: (row) => {
      const statusMap = {
        published: { label: '已发布', tone: 'success' as const },
        archived: { label: '已归档', tone: 'muted' as const },
        draft: { label: '草稿', tone: 'warning' as const },
      }
      const status = statusMap[row.status as keyof typeof statusMap] || statusMap.draft
      return <AppStatusBadge tone={status.tone} dot>{status.label}</AppStatusBadge>
    }
  },
  {
    title: '发布日期',
    key: 'published_at',
    width: '130px',
    render: (row) => (
      <div className="text-muted-foreground text-[11px] font-mono">
        <AppTime value={row.published_at || row.created_at} format="YYYY-MM-DD" />
      </div>
    )
  },
  {
    title: '操作',
    key: 'actions',
    width: '150px',
    className: 'text-center',
    render: (row) => (
      <div className="flex items-center justify-center gap-1.5">
        <AppGuard permission="news:update">
          <AppButton
            onClick={() => onEdit(row)}
            size="iconSm"
            variant="secondary"
            title="编辑内容"
          >
            <Edit className="h-3.5 w-3.5" strokeWidth={1.75} />
          </AppButton>
          {row.status !== 'published' ? (
            <AppButton
              onClick={() => onToggleStatus(row.id, 'published')}
              size="sm"
              variant="success"
              title="立即发布"
            >
              发布
            </AppButton>
          ) : (
            <AppButton
              onClick={() => onToggleStatus(row.id, 'draft')}
              size="sm"
              variant="warning"
              title="撤下到草稿"
            >
              撤回
            </AppButton>
          )}
        </AppGuard>
        <AppGuard permission="news:delete">
          <AppButton
            onClick={() => onDelete(row.id)}
            size="iconSm"
            variant="ghost"
            className="hover:text-destructive hover:bg-destructive/10"
            title="物理删除"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </AppButton>
        </AppGuard>
      </div>
    )
  }
]

export default function NewsList({
  articles, total, page, pageSize, onPageChange, isLoading, isFetching, stats,
  searchTitle, onSearchTitleChange, categoryFilter, onCategoryFilterChange,
  statusFilter, onStatusFilterChange, onRefetch, onCreate, onEdit, onDelete, onToggleTop, onToggleStatus
}: NewsListProps) {
  const columns = getColumns(onToggleTop, onEdit, onToggleStatus, onDelete)

  const toolbarFilters = (
    <div className="flex flex-wrap items-center gap-3">
      <AppInput
        type="text"
        placeholder="搜索文章标题..."
        value={searchTitle}
        onChange={(e) => onSearchTitleChange(e.target.value)}
        className="w-40"
      />

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[12px]">分类:</span>
        <AppSelect
          width="sm"
          value={categoryFilter}
          onValueChange={(val) => onCategoryFilterChange(val || 'all')}
          placeholder="显示全部"
          options={categoryOptions}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-[12px]">状态:</span>
        <AppSelect
          width="sm"
          value={statusFilter}
          onValueChange={(val) => onStatusFilterChange(val || 'all')}
          placeholder="全部"
          options={[
            { value: 'all', label: '全部状态' },
            { value: 'draft', label: '草稿' },
            { value: 'published', label: '已发布' },
            { value: 'archived', label: '已归档' },
          ]}
        />
      </div>
    </div>
  )

  const toolbarActions = (
    <div className="flex items-center gap-2">
      <AppButton
        onClick={onRefetch}
        size="icon"
        variant="secondary"
        title="刷新数据"
      >
        <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
      </AppButton>

      <AppGuard permission="news:create">
        <AppButton
          onClick={onCreate}
          icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
        >
          撰写新文章
        </AppButton>
      </AppGuard>
    </div>
  )

  return (
    <div className="space-y-6 text-foreground font-sans">
      <NewsStatsCards stats={stats} />

      <AppToolbar
        icon={<BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />}
        title="文章发布与运营矩阵"
        loading={isLoading || isFetching}
        filters={toolbarFilters}
        actions={toolbarActions}
      />

      <AppTable
        columns={columns}
        data={articles}
        isLoading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        emptyText="暂无满足筛选条件的新闻记录"
      />
    </div>
  )
}
