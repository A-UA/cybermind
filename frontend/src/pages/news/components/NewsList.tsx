import AppSelect from '@/components/common/AppSelect'
import AppStatusBadge from '@/components/common/AppStatusBadge'
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

// 紧凑型定义 Table Columns 节约空余行数
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
    render: (row) => <span className="font-bold text-muted-foreground/80 font-mono">#{row.id}</span>
  },
  {
    title: '置顶',
    key: 'is_top',
    width: '80px',
    className: 'text-center',
    render: (row) => (
      <AppGuard permission="news:update">
        <button
          onClick={() => onToggleTop(row.id, row.is_top)}
          className="p-1 border-2 border-border bg-background rounded-lg hover:bg-accent transition-all pop-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title={row.is_top ? '取消置顶' : '置顶'}
        >
          <Star className={`h-4.5 w-4.5 ${row.is_top ? 'text-amber-500 fill-amber-400' : 'text-muted-foreground/60'}`} />
        </button>
      </AppGuard>
    )
  },
  {
    title: '封面图',
    key: 'cover_image',
    width: '100px',
    render: (row) => row.cover_image ? (
      <div className="w-16 h-10 border-2 border-border bg-background rounded-lg overflow-hidden flex items-center justify-center p-0.5 relative group">
        <img src={row.cover_image} alt={row.title} className="max-w-full max-h-full object-contain rounded" />
        <a href={row.cover_image} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
          <Eye className="h-3 w-3 text-white" />
        </a>
      </div>
    ) : (
      <span className="text-[10px] text-muted-foreground/40 font-semibold font-mono">NO_IMG</span>
    )
  },
  {
    title: '标题',
    key: 'title',
    render: (row) => <span className="font-bold text-foreground truncate max-w-xs block" title={row.title}>{row.title}</span>
  },
  {
    title: '分类',
    key: 'category',
    width: '110px',
    render: (row) => <span className="px-2 py-0.5 border-2 border-border bg-background text-[10px] font-bold rounded-lg pop-shadow-sm select-none">{categoryOptions.find((o) => o.value === row.category)?.label || '未分类'}</span>
  },
  {
    title: '浏览量',
    key: 'view_count',
    width: '80px',
    className: 'text-center font-bold text-muted-foreground font-mono',
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
      return <AppStatusBadge tone={status.tone}>{status.label}</AppStatusBadge>
    }
  },
  {
    title: '发布日期',
    key: 'published_at',
    width: '130px',
    render: (row) => <div className="text-muted-foreground font-semibold text-[11px] font-mono"><AppTime value={row.published_at || row.created_at} /></div>
  },
  {
    title: '操作',
    key: 'actions',
    width: '150px',
    className: 'text-center',
    render: (row) => (
      <div className="flex items-center justify-center space-x-1.5">
        <AppGuard permission="news:update">
          <button onClick={() => onEdit(row)} className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer" title="编辑内容"><Edit className="h-3.5 w-3.5" /></button>
          {row.status !== 'published' ? (
            <button onClick={() => onToggleStatus(row.id, 'published')} className="px-2 py-1.5 border-2 border-border bg-emerald-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase" title="立即发布">发布</button>
          ) : (
            <button onClick={() => onToggleStatus(row.id, 'draft')} className="px-2 py-1.5 border-2 border-border bg-amber-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase" title="撤下到草稿">撤回</button>
          )}
        </AppGuard>
        <AppGuard permission="news:delete">
          <button onClick={() => onDelete(row.id)} className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-destructive transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer" title="物理删除"><Trash2 className="h-3.5 w-3.5" /></button>
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

  return (
    <div className="space-y-8 text-foreground font-sans">
      <NewsStatsCards stats={stats} />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">文章发布与运营矩阵</h2>
          {(isLoading || isFetching) && <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input
            type="text"
            placeholder="搜索文章标题..."
            value={searchTitle}
            onChange={(e) => onSearchTitleChange(e.target.value)}
            className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-44"
          />

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-muted-foreground">分类:</span>
            <AppSelect
              width="sm"
              value={categoryFilter}
              onValueChange={(val) => onCategoryFilterChange(val || 'all')}
              placeholder="显示全部"
              options={categoryOptions}
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-muted-foreground">状态:</span>
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

          <button onClick={onRefetch} className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer" title="刷新数据">
            <RefreshCw className="h-4 w-4" />
          </button>

          <AppGuard permission="news:create">
            <button onClick={onCreate} className="px-4 py-2 bg-primary text-primary-foreground font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs">
              <Plus className="h-4 w-4" />
              <span>撰写新文章 WRITE</span>
            </button>
          </AppGuard>
        </div>
      </div>

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
