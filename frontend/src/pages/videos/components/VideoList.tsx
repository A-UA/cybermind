import { Plus, Trash2, Edit, RefreshCw, Eye, Film, Clock, Play } from 'lucide-react'
import AppGuard from '@/components/common/AppGuard'
import AppSelect from '@/components/common/AppSelect'
import AppButton from '@/components/common/AppButton'
import AppInput from '@/components/common/AppInput'
import AppToolbar from '@/components/common/AppToolbar'
import AppStatusBadge from '@/components/common/AppStatusBadge'
import type { IOperationVideo } from '../types'
import { formatDuration } from '@/lib/utils'

interface VideoListProps {
  videos: IOperationVideo[]
  isLoading: boolean
  searchQuery: string
  onSearchQueryChange: (val: string) => void
  selectedCategory: string
  onSelectedCategoryChange: (val: string) => void
  onRefetch: () => void
  onCreate: () => void
  onEdit: (video: IOperationVideo) => void
  onDelete: (id: number) => void
  onPlay: (video: IOperationVideo) => void
  onToggleActive: (id: number, currentActive: boolean) => void
}

export default function VideoList({
  videos,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onSelectedCategoryChange,
  onRefetch,
  onCreate,
  onEdit,
  onDelete,
  onPlay,
  onToggleActive
}: VideoListProps) {
  // 提取当前视频里存在的分类做筛选列表
  const uniqueCategories = Array.from(
    new Set(videos.map((v) => v.category).filter(Boolean))
  ) as string[]

  const toolbarFilters = (
    <div className="flex flex-wrap items-center gap-3">
      <AppSelect
        width="md"
        value={selectedCategory || 'all'}
        onValueChange={(val) => onSelectedCategoryChange(val === 'all' || val === null ? '' : val)}
        placeholder="全部视频分类"
        options={[
          { value: 'all', label: '全部视频分类' },
          ...uniqueCategories.map((category) => ({ value: category, label: category })),
        ]}
      />

      <AppInput
        type="text"
        placeholder="搜索视频标题/描述..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="w-48"
      />
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

      <AppGuard permission="video:create">
        <AppButton
          onClick={onCreate}
          icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
        >
          上传视频
        </AppButton>
      </AppGuard>
    </div>
  )

  return (
    <div className="space-y-6 text-foreground font-sans text-xs">
      {/* 顶部操作过滤条 */}
      <AppToolbar
        icon={<Film className="h-5 w-5 text-primary" strokeWidth={1.75} />}
        title="操作视频管理与发布"
        loading={isLoading}
        filters={toolbarFilters}
        actions={toolbarActions}
      />

      {/* 画廊展示层 */}
      {isLoading ? (
        <div className="h-64 bg-card rounded-lg border border-border shadow-sm flex flex-col justify-center items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" strokeWidth={1.5} />
          <span className="text-[13px] text-muted-foreground font-mono">LOADING VIDEO ASSETS...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="h-64 bg-card rounded-lg border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-[13px] text-muted-foreground">暂无任何操作视频记录</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-card rounded-lg border border-border shadow-sm hover:border-primary/40 transition-colors duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* 封面/预览卡 */}
              <div className="relative aspect-video bg-accent flex items-center justify-center overflow-hidden group border-b border-border">
                {v.cover_image ? (
                  <img
                    src={v.cover_image}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                    <Film className="h-10 w-10 stroke-[1.25]" />
                    <span className="text-[11px]">无视频封面</span>
                  </div>
                )}

                {/* 时长贴纸 */}
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono rounded-md shadow-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    <span>{formatDuration(v.duration)}</span>
                  </span>
                </div>

                {/* 发布状态 */}
                <div className="absolute top-2.5 right-2.5">
                  <AppStatusBadge tone={v.is_active ? 'success' : 'muted'} dot className="bg-card/85 backdrop-blur-sm shadow-sm border border-border">
                    {v.is_active ? '已发布' : '草稿'}
                  </AppStatusBadge>
                </div>

                {/* 悬浮播放按钮 */}
                <button
                  onClick={() => onPlay(v)}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer animate-fade-in"
                >
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                    <Play className="h-5 w-5 fill-current ml-0.5" strokeWidth={1.5} />
                  </div>
                </button>
              </div>

              {/* 文字元数据 */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[11px] font-medium rounded-full select-none">
                      {v.category || '未分类'}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">#{v.id}</span>
                  </div>
                  <h3 className="font-heading text-[14px] text-foreground line-clamp-1 select-all">{v.title}</h3>
                  <p className="text-muted-foreground text-[12px] leading-relaxed line-clamp-2">
                    {v.description || '暂无视频描述'}
                  </p>
                </div>

                {/* 状态统计量与按钮组 */}
                <div className="pt-4 border-t border-border flex items-center justify-between text-[11px]">
                  {/* 观看数 */}
                  <div className="flex items-center gap-1 text-muted-foreground font-mono">
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{v.view_count} 次</span>
                  </div>

                  {/* 操作组 */}
                  <div className="flex items-center gap-1.5">
                    <AppGuard permission="video:update">
                      <AppButton
                        onClick={() => onEdit(v)}
                        size="iconSm"
                        variant="secondary"
                        title="编辑属性"
                      >
                        <Edit className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </AppButton>

                      <AppButton
                        onClick={() => onToggleActive(v.id, !v.is_active)}
                        size="sm"
                        variant={v.is_active ? 'warning' : 'success'}
                      >
                        {v.is_active ? '下架' : '上架'}
                      </AppButton>
                    </AppGuard>

                    <AppGuard permission="video:delete">
                      <AppButton
                        onClick={() => onDelete(v.id)}
                        size="iconSm"
                        variant="ghost"
                        className="hover:text-destructive hover:bg-destructive/10"
                        title="删除视频"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </AppButton>
                    </AppGuard>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
