import { useState } from 'react'
import { toast } from 'sonner'
import type { IBanner } from '@/types/banner'
import AppSelect from '@/components/common/AppSelect'
import AppStatusBadge from '@/components/common/AppStatusBadge'
import AppButton from '@/components/common/AppButton'
import { Plus, Trash2, Edit, RefreshCw, Eye, ExternalLink, SlidersHorizontal } from 'lucide-react'
import BannerForm from './components/BannerForm'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppTime from '@/components/common/AppTime'
import AppToolbar from '@/components/common/AppToolbar'
import { useConfirmStore } from '@/stores/useConfirmStore'
import { useBannerList, useDeleteBanner } from '@/queries/useBannerQuery'

export default function BannersPage() {
  const { showConfirm } = useConfirmStore()

  // 分页与筛选状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [isActiveFilter, setIsActiveFilter] = useState('all')

  // 表单对话框状态
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null)

  // ==================== 1. API 数据拉取 ====================

  const { data, isLoading, isFetching, refetch } = useBannerList({
    page,
    page_size: pageSize,
    is_active: isActiveFilter === 'all' ? undefined : isActiveFilter === 'active',
  })

  const banners: IBanner[] = data?.items || []
  const total = data?.total || 0

  // ==================== 2. API Mutations ====================

  const deleteMutation = useDeleteBanner()

  const handleDelete = (id: number) => {
    showConfirm({
      title: '确认删除',
      message: '确认要删除此 Banner 吗？删除后前台页面将无法继续渲染该项。',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id)
        toast.success('Banner 数据已成功从云端下架')
      }
    })
  }

  const handleCreateClick = () => {
    setSelectedBanner(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (banner: IBanner) => {
    setSelectedBanner(banner)
    setIsFormOpen(true)
  }

  // 表格列配置
  const columns: AppTableColumn<IBanner>[] = [
    {
      title: 'ID',
      key: 'id',
      width: '60px',
      render: (row) => (
        <span className="font-mono text-muted-foreground">
          #{row.id}
        </span>
      )
    },
    {
      title: '缩略图',
      key: 'image_url',
      width: '100px',
      render: (row) => (
        <div className="w-16 h-10 border border-border bg-card rounded-lg overflow-hidden flex items-center justify-center p-0.5 group relative">
          <img
            src={row.image_url}
            alt={row.title}
            className="max-w-full max-h-full object-contain rounded-md transition-transform duration-200 group-hover:scale-105"
          />
          <a
            href={row.image_url}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"
          >
            <Eye className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
          </a>
        </div>
      )
    },
    {
      title: '标题',
      key: 'title',
      render: (row) => (
        <span className="font-medium text-foreground truncate block max-w-xs">
          {row.title}
        </span>
      )
    },
    {
      title: '跳转链路',
      key: 'link_url',
      render: (row) => row.link_url ? (
        <a
          href={row.link_url}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-[11px] font-mono transition-colors"
        >
          <span className="truncate max-w-[120px]">{row.link_url}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
        </a>
      ) : (
        <span className="text-muted-foreground/40 font-mono">--</span>
      )
    },
    {
      title: '排序',
      key: 'sort_order',
      width: '80px',
      className: 'text-center font-mono text-muted-foreground',
      render: (row) => row.sort_order
    },
    {
      title: '状态',
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
      title: '最后修改时间',
      key: 'updated_at',
      width: '150px',
      render: (row) => (
        <div className="text-muted-foreground font-mono text-[11px]">
          <AppTime value={row.updated_at} format="YYYY-MM-DD HH:mm" />
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: '110px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <AppButton
            onClick={() => handleEditClick(row)}
            size="iconSm"
            variant="secondary"
            title="编辑"
          >
            <Edit className="h-3.5 w-3.5" strokeWidth={1.75} />
          </AppButton>
          <AppButton
            onClick={() => handleDelete(row.id)}
            size="iconSm"
            variant="ghost"
            className="hover:text-destructive hover:bg-destructive/10"
            title="删除"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </AppButton>
        </div>
      )
    }
  ]

  // 工具栏过滤器
  const toolbarFilters = (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-[12px]">状态过滤:</span>
      <AppSelect
        width="sm"
        value={isActiveFilter}
        onValueChange={(val) => {
          setIsActiveFilter(val || 'all')
          setPage(1)
        }}
        placeholder="全部状态"
        options={[
          { value: 'all', label: '显示全部' },
          { value: 'active', label: '已启用' },
          { value: 'inactive', label: '已下线' },
        ]}
      />
    </div>
  )

  // 工具栏动作
  const toolbarActions = (
    <div className="flex items-center gap-2">
      <AppButton
        onClick={() => refetch()}
        size="icon"
        variant="secondary"
        title="刷新数据"
      >
        <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
      </AppButton>

      <AppButton
        onClick={handleCreateClick}
        icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
      >
        新建 Banner
      </AppButton>
    </div>
  )

  return (
    <div className="space-y-6 text-foreground font-sans text-xs">
      {/* 顶部操作过滤条 */}
      <AppToolbar
        icon={<SlidersHorizontal className="h-5 w-5 text-primary" strokeWidth={1.75} />}
        title="Banner 数据分发控制"
        loading={isLoading || isFetching}
        filters={toolbarFilters}
        actions={toolbarActions}
      />

      {/* 数据列表面板 */}
      <AppTable
        columns={columns}
        data={banners}
        isLoading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyText="暂无可用数据记录"
      />

      {/* 新建/编辑对话框表单 */}
      <BannerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        banner={selectedBanner}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
