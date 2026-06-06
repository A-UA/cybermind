import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { IBanner } from '@/types/banner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, Trash2, Edit, RefreshCw, Eye, ExternalLink, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import BannerForm from './BannerForm'

export default function BannersPage() {
  const queryClient = useQueryClient()
  
  // 分页与筛选状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')

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
      const res = await apiClient.get('/banners/', { params })
      return res.data.data
    }
  })

  const banners: IBanner[] = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

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
    if (window.confirm('确认要删除此 Banner 吗？删除后前台页面将无法继续渲染该项。')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCreateClick = () => {
    setSelectedBanner(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (banner: IBanner) => {
    setSelectedBanner(banner)
    setIsFormOpen(true)
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString() + ' ' + d.toTimeString().substring(0, 5)
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部操作过滤条 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 elegant-shadow p-5 rounded-2xl transition-all duration-300">
        <div className="flex items-center space-x-2.5">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Banner 数据分发控制
          </h2>
          {(isLoading || isFetching) && (
            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* 状态过滤 */}
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">过滤:</span>
            <Select
              value={isActiveFilter}
              onValueChange={(val) => {
                setIsActiveFilter(val || 'all')
                setPage(1)
              }}
            >
              <SelectTrigger className="w-28 h-9 bg-secondary/40 border-transparent text-foreground text-xs rounded-xl focus:ring-0">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground rounded-xl text-xs">
                <SelectItem value="all">显示全部</SelectItem>
                <SelectItem value="active">已启用</SelectItem>
                <SelectItem value="inactive">已下线</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all rounded-xl cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-[#111622] hover:bg-[#1e2536] dark:bg-[#e2e8f0] dark:hover:bg-[#f3f4f6] text-white dark:text-black font-semibold flex items-center space-x-1.5 transition-all rounded-xl cursor-pointer text-xs shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>新建 Banner</span>
          </button>
        </div>
      </div>

      {/* 数据列表面板 */}
      <div className="border border-border/60 bg-card elegant-shadow rounded-2xl overflow-hidden transition-all duration-300">
        {isLoading ? (
          <div className="h-64 flex flex-col justify-center items-center space-y-3">
            <RefreshCw className="h-8 w-8 text-primary/60 animate-spin" />
            <span className="text-xs text-muted-foreground">正在载入数据资源...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-muted-foreground">暂无可用数据记录</span>
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="font-semibold text-muted-foreground w-14">ID</TableHead>
                <TableHead className="font-semibold text-muted-foreground w-24">缩略图</TableHead>
                <TableHead className="font-semibold text-muted-foreground">标题</TableHead>
                <TableHead className="font-semibold text-muted-foreground">跳转链路</TableHead>
                <TableHead className="font-semibold text-muted-foreground w-20 text-center">排序</TableHead>
                <TableHead className="font-semibold text-muted-foreground w-24 text-center">状态</TableHead>
                <TableHead className="font-semibold text-muted-foreground w-40">最后修改时间</TableHead>
                <TableHead className="font-semibold text-muted-foreground w-24 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow
                  key={banner.id}
                  className="border-b border-border/40 hover:bg-secondary/20 transition-all"
                >
                  {/* ID */}
                  <TableCell className="font-semibold text-muted-foreground/80">
                    #{banner.id}
                  </TableCell>
                  
                  {/* 缩略图 */}
                  <TableCell>
                    <div className="w-16 h-10 border border-border/40 bg-secondary/30 rounded-lg overflow-hidden flex items-center justify-center p-0.5 group relative">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="max-w-full max-h-full object-contain rounded-md transition-transform group-hover:scale-105"
                      />
                      <a
                        href={banner.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        <Eye className="h-3.5 w-3.5 text-white" />
                      </a>
                    </div>
                  </TableCell>

                  {/* 标题 */}
                  <TableCell className="font-semibold text-foreground truncate max-w-xs">
                    {banner.title}
                  </TableCell>

                  {/* 跳转链接 */}
                  <TableCell className="text-muted-foreground text-[11px] truncate max-w-[150px]">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary inline-flex items-center space-x-1"
                      >
                        <span className="truncate max-w-[120px]">{banner.link_url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/40">--</span>
                    )}
                  </TableCell>

                  {/* 排序 */}
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {banner.sort_order}
                  </TableCell>

                  {/* 状态 */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${banner.is_active ? 'bg-primary' : 'bg-muted-foreground/35'}`} />
                      <span className={`text-[10px] font-semibold ${banner.is_active ? 'text-primary' : 'text-muted-foreground/60'}`}>
                        {banner.is_active ? '分发中' : '已下线'}
                      </span>
                    </div>
                  </TableCell>

                  {/* 修改时间 */}
                  <TableCell className="text-muted-foreground text-[11px]">
                    {formatDate(banner.updated_at)}
                  </TableCell>

                  {/* 操作 */}
                  <TableCell>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(banner)}
                        className="p-2 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all rounded-lg cursor-pointer"
                        title="编辑"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-rose-600 transition-all rounded-lg cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 底部分页组件 */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 p-4 bg-secondary/10 text-[11px] text-muted-foreground">
            <div>
              共计 <span className="font-semibold">{total}</span> 条数据 // 当前第{' '}
              <span className="font-semibold">{page}</span> /{' '}
              <span className="font-semibold">{totalPages}</span> 页
            </div>
            <div className="flex space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all rounded-xl cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
              >
                上一页
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all rounded-xl cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

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
