import { Plus, Trash2, Edit, RefreshCw, Eye, Film, Clock, Play } from 'lucide-react'
import AppGuard from '@/components/common/AppGuard'
import type { IOperationVideo } from '../types'

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

// 格式化时长为 mm:ss
function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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

  return (
    <div className="space-y-6 text-foreground font-sans text-xs">
      {/* 操作与筛选条 (新野兽派拼贴卡) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-2.5">
          <Film className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-heading font-bold tracking-wider uppercase">
            操作视频管理与发布
          </h2>
          {isLoading && (
            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => onSelectedCategoryChange(e.target.value)}
            className="px-3 py-2 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-bold cursor-pointer"
          >
            <option value="">全部视频分类</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* 搜索 */}
          <input
            type="text"
            placeholder="搜索视频标题/描述..."
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

          <AppGuard permission="video:create">
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-[#FEF9E7] text-black font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>上传视频 UPLOAD</span>
            </button>
          </AppGuard>
        </div>
      </div>

      {/* 画廊展示层 */}
      {isLoading ? (
        <div className="h-64 border-2 border-border bg-card rounded-xl pop-shadow flex flex-col justify-center items-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">正在载入操作视频资源...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="h-64 border-2 border-border bg-card rounded-xl pop-shadow flex flex-col justify-center items-center text-center">
          <span className="text-xs text-muted-foreground font-semibold">暂无任何操作视频记录</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-card border-2 border-border rounded-xl pop-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)] transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* 封面/预览卡 */}
              <div className="relative aspect-video bg-[#E8F4FD] dark:bg-slate-800 border-b-2 border-border flex items-center justify-center overflow-hidden group">
                {v.cover_image ? (
                  <img
                    src={v.cover_image}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-muted-foreground/60">
                    <Film className="h-10 w-10 stroke-1" />
                    <span className="text-[10px] font-bold">无视频封面</span>
                  </div>
                )}

                {/* 时长贴纸 */}
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 border-2 border-border bg-black text-white text-[9px] font-bold font-mono rounded-md shadow-sm">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{formatDuration(v.duration)}</span>
                  </span>
                </div>

                {/* 发布状态 */}
                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 bg-background border-2 border-border px-2 py-0.5 rounded-lg text-[10px] font-bold pop-shadow-sm select-none">
                  <span className={`w-2 h-2 rounded-full ${v.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
                  <span>{v.is_active ? '已发布' : '草稿'}</span>
                </div>

                {/* 悬浮播放按钮 */}
                <button
                  onClick={() => onPlay(v)}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer animate-fade-in"
                >
                  <div className="w-12 h-12 bg-primary border-2 border-border rounded-full flex items-center justify-center text-primary-foreground pop-shadow-sm hover:scale-105 active:scale-95 transition-all">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </button>
              </div>

              {/* 文字元数据 */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 border-2 border-border bg-[#F5EEF8] dark:bg-slate-700 text-foreground text-[9px] font-bold rounded-lg pop-shadow-sm">
                      {v.category || '未分类'}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground font-mono">#{v.id}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-foreground line-clamp-1 select-all">{v.title}</h3>
                  <p className="text-muted-foreground text-[11px] font-semibold leading-relaxed line-clamp-2">
                    {v.description || '暂无视频描述'}
                  </p>
                </div>

                {/* 状态统计量与按钮组 */}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between text-[10px]">
                  {/* 观看数 */}
                  <div className="flex items-center space-x-1 text-muted-foreground font-bold font-mono">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{v.view_count} 次播放</span>
                  </div>

                  {/* 操作组 */}
                  <div className="flex items-center space-x-1.5">
                    <AppGuard permission="video:update">
                      <button
                        onClick={() => onEdit(v)}
                        className="p-1.5 border border-border bg-background hover:bg-accent text-foreground transition-all rounded-md cursor-pointer"
                        title="编辑属性"
                      >
                        <Edit className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => onToggleActive(v.id, !v.is_active)}
                        className={`px-2 py-1 border border-border text-black font-bold rounded-md cursor-pointer transition-all ${v.is_active ? 'bg-amber-300 hover:bg-amber-400' : 'bg-emerald-300 hover:bg-emerald-400'}`}
                      >
                        {v.is_active ? '下架' : '上架'}
                      </button>
                    </AppGuard>

                    <AppGuard permission="video:delete">
                      <button
                        onClick={() => onDelete(v.id)}
                        className="p-1.5 border border-border bg-background hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md cursor-pointer"
                        title="物理擦除"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
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
