import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { IBanner } from '@/types/banner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Edit, RefreshCw, Eye, ExternalLink, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import BannerForm from './components/BannerForm'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppTime from '@/components/common/AppTime'
import { useConfirmStore } from '@/stores/useConfirmStore'

export default function BannersPage() {
  const queryClient = useQueryClient()
  const { showConfirm } = useConfirmStore()
  
  // 分页与筛选状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [isActiveFilter, setIsActiveFilter] = useState('all')

  // 表单对话框状态
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null)

  // 获取 Banner 列表
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['banners', page, isActiveFilter],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize }
      if (isActiveFilter !== 'all') {
        params.is_active = isActiveFilter === 'active'
      }
      const res = await apiClient.get('/banners', { params })
      return res.data.data
    }
  })

  const banners: IBanner[] = data?.items || []
  const total = data?.total || 0

  // 删除 Banner Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/banners/${id}`)
    },
    onSuccess: () => {
      toast.success('Banner 数据已成功从云端下架')
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || '操作失败'
      toast.error(msg)
    }
  })

  const handleDelete = (id: number) => {
    showConfirm({
      title: '确认删除',
      message: '确认要删除此 Banner 吗？删除后前台页面将无法继续渲染该项。',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id)
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
        <span className="font-bold text-muted-foreground/80 font-mono">
          #{row.id}
        </span>
      )
    },
    {
      title: '缩略图',
      key: 'image_url',
      width: '100px',
      render: (row) => (
        <div className="w-16 h-10 border-2 border-border bg-background rounded-lg overflow-hidden flex items-center justify-center p-0.5 group relative">
          <img
            src={row.image_url}
            alt={row.title}
            className="max-w-full max-h-full object-contain rounded-md transition-transform group-hover:scale-105"
          />
          <a
            href={row.image_url}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
          >
            <Eye className="h-3.5 w-3.5 text-white" />
          </a>
        </div>
      )
    },
    {
      title: '标题',
      key: 'title',
      render: (row) => (
        <span className="font-bold text-foreground truncate block max-w-xs">
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
          className="hover:text-primary inline-flex items-center space-x-1 text-muted-foreground text-[11px] font-semibold"
        >
          <span className="truncate max-w-[120px]">{row.link_url}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      ) : (
        <span className="text-muted-foreground/40 font-mono">--</span>
      )
    },
    {
      title: '排序',
      key: 'sort_order',
      width: '80px',
      className: 'text-center font-bold text-muted-foreground font-mono',
      render: (row) => row.sort_order
    },
    {
      title: '状态',
      key: 'is_active',
      width: '110px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full inline-block border-2 border-border ${row.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/35'}`} />
          <span className={`text-[10px] font-bold ${row.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/60'}`}>
            {row.is_active ? '分发中' : '已下线'}
          </span>
        </div>
      )
    },
    {
      title: '最后修改时间',
      key: 'updated_at',
      width: '150px',
      render: (row) => (
        <div className="text-muted-foreground font-semibold text-[11px] font-mono">
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
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleEditClick(row)}
            className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
            title="编辑"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-destructive transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
            title="删除"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 text-foreground font-sans text-xs">
      {/* 顶部操作过滤条 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-2.5">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
            Banner 数据分发控制
          </h2>
          {(isLoading || isFetching) && (
            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* 状态过滤 */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-muted-foreground">过滤:</span>
            <Select
              value={isActiveFilter}
              onValueChange={(val) => {
                setIsActiveFilter(val || 'all')
                setPage(1)
              }}
            >
              <SelectTrigger className="w-28 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg focus:ring-0 font-semibold">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent className="bg-card border-2 border-border text-foreground rounded-lg text-xs font-semibold">
                <SelectItem value="all">显示全部</SelectItem>
                <SelectItem value="active">已启用</SelectItem>
                <SelectItem value="inactive">已下线</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>新建 Banner</span>
          </button>
        </div>
      </div>

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
