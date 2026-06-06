import React, { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Play,
  Save,
  ArrowLeft,
  Film,
  Image as ImageIcon,
  Eye,
  Clock,
  Video as VideoIcon
} from 'lucide-react'

interface IOperationVideo {
  id: number
  title: string
  description?: string
  video_url: string
  cover_image?: string
  duration?: number
  category?: string
  sort_order: number
  is_active: boolean
  view_count: number
  created_by: number
  created_at: string
  updated_at: string
}

// 格式化时长为 mm:ss
function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function VideosPage() {
  // 页面视图：'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingVideo, setEditingVideo] = useState<IOperationVideo | null>(null)

  // 搜索和过滤
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // 播放器弹窗状态
  const [activePlayVideo, setActivePlayVideo] = useState<IOperationVideo | null>(null)

  // 表单输入状态
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [category, setCategory] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  // 独立文件上传状态
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  
  const [imageUploading, setImageUploading] = useState(false)
  const [imageProgress, setImageProgress] = useState(0)

  // 获取视频列表
  const { data = { items: [] as IOperationVideo[], total: 0 }, isLoading, refetch } = useQuery<{
    items: IOperationVideo[]
    total: number
  }>({
    queryKey: ['operation-videos', searchQuery, selectedCategory],
    queryFn: async () => {
      const params: any = {}
      if (searchQuery.trim()) params.query = searchQuery
      if (selectedCategory) params.category = selectedCategory
      const res = await apiClient.get('/videos', { params })
      return res.data.data
    }
  })

  const videos = data.items || []

  // 提取当前视频里存在的分类做筛选列表
  const uniqueCategories = Array.from(
    new Set(videos.map((v) => v.category).filter(Boolean))
  ) as string[]

  // --- 视频/封面文件上传 ---
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setVideoUploading(true)
    setVideoProgress(0)

    try {
      const res = await apiClient.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setVideoProgress(percent)
        }
      })
      setVideoUrl(res.data.data.url)
      toast.success('视频文件已成功分发并装载')
    } catch (err: any) {
      toast.error(err.response?.data?.message || '视频文件上传失败')
    } finally {
      setVideoUploading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setImageUploading(true)
    setImageProgress(0)

    try {
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setImageProgress(percent)
        }
      })
      setCoverImage(res.data.data.url)
      toast.success('封面图已成功上传')
    } catch (err: any) {
      toast.error(err.response?.data?.message || '封面上传失败')
    } finally {
      setImageUploading(false)
    }
  }

  // --- 视频 CRUD Mutation ---
  const saveVideoMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description: description || null,
        video_url: videoUrl,
        cover_image: coverImage || null,
        duration: duration === '' ? null : Number(duration),
        category: category || null,
        sort_order: sortOrder,
        is_active: isActive
      }

      if (view === 'edit' && editingVideo) {
        await apiClient.put(`/videos/${editingVideo.id}`, payload)
      } else {
        await apiClient.post('/videos/', payload)
      }
    },
    onSuccess: () => {
      toast.success(view === 'edit' ? '操作视频已成功修改' : '成功创建新操作视频')
      setView('list')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/videos/${id}`)
    },
    onSuccess: () => {
      toast.success('操作视频已成功移除')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '删除视频失败')
    }
  })

  // 快捷切换启用/禁用
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activeVal }: { id: number; activeVal: boolean }) => {
      await apiClient.put(`/videos/${id}`, { is_active: activeVal })
    },
    onSuccess: () => {
      toast.success('视频前台分发状态已刷新')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  const handleCreateClick = () => {
    setEditingVideo(null)
    setTitle('')
    setDescription('')
    setVideoUrl('')
    setCoverImage('')
    setDuration('')
    setCategory('')
    setSortOrder(0)
    setIsActive(true)
    setView('create')
  }

  const handleEditClick = (v: IOperationVideo) => {
    setEditingVideo(v)
    setTitle(v.title)
    setDescription(v.description || '')
    setVideoUrl(v.video_url)
    setCoverImage(v.cover_image || '')
    setDuration(v.duration ?? '')
    setCategory(v.category || '')
    setSortOrder(v.sort_order)
    setIsActive(v.is_active)
    setView('edit')
  }

  const handleDelete = (id: number) => {
    if (window.confirm('确认要物理删除此操作视频吗？此操作无法撤销。')) {
      deleteVideoMutation.mutate(id)
    }
  }

  // 触发视频播放并自增播放量
  const handlePlayVideo = async (v: IOperationVideo) => {
    setActivePlayVideo(v)
    try {
      // 请求后端详情页，并携带自增参数，异步记录观看
      await apiClient.get(`/videos/${v.id}`, { params: { increment_view: true } })
      refetch() // 刷新列表以显示最新播放数
    } catch {
      // 静默失败
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('视频标题不能为空')
      return
    }
    if (!videoUrl.trim()) {
      toast.error('请上传视频文件或填写视频 URL')
      return
    }
    saveVideoMutation.mutate()
  }

  // 列表视图
  if (view === 'list') {
    return (
      <div className="space-y-6 text-foreground font-sans">
        
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
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-48"
            />

            <button
              onClick={() => refetch()}
              className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
              title="刷新数据"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-[#FEF9E7] text-black font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>上传视频 UPLOAD</span>
            </button>
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

                  {/* 时长贴纸 (左下) */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 border-2 border-border bg-black text-white text-[9px] font-bold font-mono rounded-md shadow-sm">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatDuration(v.duration)}</span>
                    </span>
                  </div>

                  {/* 分配状态 (右上) */}
                  <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 bg-background border-2 border-border px-2 py-0.5 rounded-lg text-[10px] font-bold pop-shadow-sm select-none">
                    <span className={`w-2 h-2 rounded-full ${v.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
                    <span>{v.is_active ? '已发布' : '草稿'}</span>
                  </div>

                  {/* 悬浮播放按钮 */}
                  <button
                    onClick={() => handlePlayVideo(v)}
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
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
                      <button
                        onClick={() => handleEditClick(v)}
                        className="p-1.5 border border-border bg-background hover:bg-accent text-foreground transition-all rounded-md cursor-pointer"
                        title="编辑属性"
                      >
                        <Edit className="h-3 w-3" />
                      </button>

                      {v.is_active ? (
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: v.id, activeVal: false })}
                          className="px-2 py-1 border border-border bg-amber-300 text-black font-bold hover:bg-amber-400 rounded-md cursor-pointer transition-all"
                        >
                          下架
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: v.id, activeVal: true })}
                          className="px-2 py-1 border border-border bg-emerald-300 text-black font-bold hover:bg-emerald-400 rounded-md cursor-pointer transition-all"
                        >
                          上架
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 border border-border bg-background hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md cursor-pointer"
                        title="物理擦除"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 视频预览播放遮罩浮层 */}
        {activePlayVideo && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-3xl w-full overflow-hidden flex flex-col justify-between">
              {/* 弹窗顶部栏 */}
              <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-foreground flex items-center space-x-1.5">
                  <Play className="h-4 w-4 text-primary fill-current" />
                  <span>视频在线预览: {activePlayVideo.title}</span>
                </h3>
                <button
                  onClick={() => setActivePlayVideo(null)}
                  className="px-3 py-1 bg-background border-2 border-border hover:bg-accent text-foreground text-xs font-bold rounded-lg pop-shadow-sm cursor-pointer"
                >
                  关闭
                </button>
              </div>

              {/* 视频播放窗口 */}
              <div className="p-6 bg-background flex justify-center items-center">
                <video
                  src={activePlayVideo.video_url}
                  controls
                  autoPlay
                  className="max-h-[50vh] w-full border-2 border-border rounded-lg pop-shadow-sm bg-black"
                />
              </div>

              {/* 弹窗底部说明 */}
              <div className="p-4 border-t-2 border-border text-center text-[10px] text-muted-foreground font-semibold">
                在线流媒体传输就绪 // VIDEOSTREAM LOADED
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染编辑或创建表单
  return (
    <div className="space-y-6 text-foreground font-sans">
      
      {/* 顶部控制头卡纸 */}
      <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView('list')}
            className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center justify-center"
            title="返回视频画廊"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider uppercase">
              {view === 'edit' ? '编辑操作视频信息' : '上传并创建操作视频'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">请上传视频文件与封面图并编辑元数据信息</p>
          </div>
        </div>
        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[-2.5deg] hidden sm:inline-block">
          VIDEO UPLOAD PANEL
        </div>
      </div>

      {/* 核心大表单 */}
      <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧：文件上传与描述 (两列) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 视频标题 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground block">
                视频标题 / VIDEO TITLE
              </label>
              <input
                type="text"
                required
                placeholder="请输入视频描述标题，例如：系统操作与新手引导教程..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-bold"
              />
            </div>

            {/* 视频文件上传与进度条 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground block">
                上传视频文件 / UPLOAD VIDEO FILE
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={videoUploading}
                  className="px-4 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center space-x-1.5"
                >
                  <VideoIcon className="h-4 w-4" />
                  <span>{videoUploading ? '正在上传...' : '选择视频文件'}</span>
                </button>
                <input
                  type="text"
                  placeholder="视频源链接地址 (video_url)..."
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border-2 border-border rounded-lg outline-none font-semibold text-xs text-foreground"
                />
              </div>

              {/* 新野兽派物理进度条 */}
              {videoUploading && (
                <div className="mt-3 p-3 bg-background border-2 border-border rounded-lg">
                  <div className="flex justify-between text-[10px] font-bold font-mono mb-1">
                    <span>文件传输进度 // FILE_TRANSFER_PROCESS</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <div className="w-full h-5 bg-[#E8F4FD] border-2 border-border rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-yellow-400 border-r-2 border-border transition-all duration-100"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 封面图上传 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground block">
                视频封面图 / COVER IMAGE
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="px-4 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center space-x-1.5"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>{imageUploading ? '正在上传...' : '选择封面图'}</span>
                </button>
                <input
                  type="text"
                  placeholder="封面图片 URL 地址..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border-2 border-border rounded-lg outline-none font-semibold text-xs text-foreground"
                />
              </div>

              {/* 封面上传进度条 */}
              {imageUploading && (
                <div className="mt-3 p-3 bg-background border-2 border-border rounded-lg">
                  <div className="flex justify-between text-[10px] font-bold font-mono mb-1">
                    <span>封面图片传输中...</span>
                    <span>{imageProgress}%</span>
                  </div>
                  <div className="w-full h-4 bg-[#E8F4FD] border-2 border-border rounded-md overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-100"
                      style={{ width: `${imageProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 封面预览 */}
              {coverImage && (
                <div className="mt-3 p-2 bg-[#FEF9E7] border-2 border-border rounded-lg max-w-xs pop-shadow-sm">
                  <img src={coverImage} alt="封面预览" className="w-full h-auto rounded border border-border object-contain max-h-36" />
                </div>
              )}
            </div>

            {/* 视频描述 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground block">
                视频描述详情 / VIDEO DESCRIPTION
              </label>
              <textarea
                rows={5}
                placeholder="请输入该操作视频的详细描述内容，以供前台用户了解..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-bold resize-y"
              />
            </div>
          </div>

          {/* 右侧：属性管理 (一列) */}
          <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
            <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
              属性与分类配置 / CONFIG
            </h3>

            {/* 视频分类 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground block">
                视频分类标签 / CATEGORY
              </label>
              <input
                type="text"
                placeholder="例如：新手引导、核心功能、FAQ等"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold"
              />
            </div>

            {/* 视频时长 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground block">
                视频时长（秒）/ DURATION (SECONDS)
              </label>
              <input
                type="number"
                placeholder="填入视频时长秒数..."
                value={duration}
                onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </div>

            {/* 排序序号 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground block">
                排序序号 / SORT ORDER
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </div>

            {/* 启用/下线 状态 */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 bg-background border-2 border-border text-primary focus:ring-0 rounded-md cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">
                  上架启用此操作视频 (ACTIVE)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 保存取消按钮组 */}
        <div className="flex justify-end space-x-3 border-t-2 border-border pt-6 mt-6">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-5 py-2.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
          >
            取消 CANCEL
          </button>
          <button
            type="submit"
            disabled={saveVideoMutation.isPending}
            className="px-8 py-2.5 bg-primary text-primary-foreground border-2 border-border font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            {saveVideoMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>确认保存 SUBMIT</span>
          </button>
        </div>
      </form>
    </div>
  )
}
