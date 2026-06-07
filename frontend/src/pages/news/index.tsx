import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
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
import { Plus, Trash2, Edit, RefreshCw, Eye, ArrowLeft, Save, Upload, Star, BookOpen, Layers } from 'lucide-react'
import RichEditor from '@/components/rich-editor/RichEditor'

interface INewsArticle {
  id: number
  title: string
  summary?: string
  content: string
  cover_image?: string
  category?: string
  tags?: string
  status: string
  view_count: number
  is_top: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

interface INewsStats {
  total_articles: number
  total_views: number
  hot_articles: { id: number; title: string; view_count: number }[]
}

export default function NewsPage() {
  const queryClient = useQueryClient()

  // 视图状态: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingArticle, setEditingArticle] = useState<INewsArticle | null>(null)

  // 列表筛选状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // 表单状态
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('行业动态')
  const [tagsInput, setTagsInput] = useState('')
  const [isTop, setIsTop] = useState(false)
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // 1. 获取新闻列表
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['news', page, searchTitle, statusFilter, categoryFilter],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize }
      if (searchTitle.trim()) params.title = searchTitle
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.category = categoryFilter
      const res = await apiClient.get('/news', { params })
      return res.data.data
    }
  })

  const articles: INewsArticle[] = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  // 2. 获取统计数据
  const { data: stats, refetch: refetchStats } = useQuery<INewsStats>({
    queryKey: ['news-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/news/stats')
      return res.data.data
    }
  })

  // 3. 删除文章 Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/news/${id}`)
    },
    onSuccess: () => {
      toast.success('文章已成功从数据库抹除')
      queryClient.invalidateQueries({ queryKey: ['news'] })
      refetchStats()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  // 4. 置顶切换 Mutation
  const toggleTopMutation = useMutation({
    mutationFn: async ({ id, isTopVal }: { id: number; isTopVal: boolean }) => {
      await apiClient.put(`/news/${id}`, { is_top: isTopVal })
    },
    onSuccess: () => {
      toast.success('置顶状态更新成功')
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '更新置顶失败')
    }
  })

  // 5. 改变状态 Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, targetStatus }: { id: number; targetStatus: string }) => {
      await apiClient.put(`/news/${id}/status`, { status: targetStatus })
    },
    onSuccess: () => {
      toast.success('文章发布状态已改变')
      queryClient.invalidateQueries({ queryKey: ['news'] })
      refetchStats()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '发布修改失败')
    }
  })

  // 6. 保存或创建文章 Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const tagsList = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      const tagsStr = tagsList.length > 0 ? JSON.stringify(tagsList) : null

      const payload = {
        title,
        summary: summary || null,
        content,
        cover_image: coverImage || null,
        category,
        tags: tagsStr,
        is_top: isTop
      }

      if (view === 'edit' && editingArticle) {
        await apiClient.put(`/news/${editingArticle.id}`, payload)
      } else {
        await apiClient.post('/news', payload)
      }
    },
    onSuccess: () => {
      toast.success(view === 'edit' ? '文章内容更新成功' : '新闻文章创建成功')
      setView('list')
      queryClient.invalidateQueries({ queryKey: ['news'] })
      refetchStats()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作保存失败')
    }
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await apiClient.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setCoverImage(res.data.data.url)
        toast.success('封面图上传成功')
      } catch (err: any) {
        toast.error(err.response?.data?.message || '封面上传失败')
      } finally {
        setUploading(false)
      }
    }
  }

  const handleEditClick = (article: INewsArticle) => {
    setEditingArticle(article)
    setTitle(article.title)
    setSummary(article.summary || '')
    setCoverImage(article.cover_image || '')
    setCategory(article.category || '行业动态')
    setContent(article.content)
    setIsTop(article.is_top)
    
    // tags 解析
    if (article.tags) {
      try {
        const tagsArr = JSON.parse(article.tags)
        setTagsInput(Array.isArray(tagsArr) ? tagsArr.join(', ') : '')
      } catch {
        setTagsInput(article.tags)
      }
    } else {
      setTagsInput('')
    }
    setView('edit')
  }

  const handleCreateClick = () => {
    setEditingArticle(null)
    setTitle('')
    setSummary('')
    setCoverImage('')
    setCategory('行业动态')
    setContent('')
    setIsTop(false)
    setTagsInput('')
    setView('create')
  }

  const handleDelete = (id: number) => {
    if (window.confirm('确认要物理删除此文章吗？此操作无法撤销。')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('文章标题不能为空')
      return
    }
    if (!content.trim()) {
      toast.error('文章正文内容不能为空')
      return
    }
    saveMutation.mutate()
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  // 渲染列表视图
  if (view === 'list') {
    return (
      <div className="space-y-8 text-foreground font-sans">
        {/* 顶部数据汇总指标 (新野兽派撞色拼贴卡片) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#E8F4FD] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow flex items-center justify-between">
            <div>
              <span className="text-[10px] text-foreground font-heading font-bold uppercase tracking-wider block">全站总文章数 / TOTAL POSTS</span>
              <span className="text-4xl font-heading font-bold mt-2.5 block text-foreground select-all">
                {stats?.total_articles ?? 0}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-background border-2 border-border flex items-center justify-center text-primary font-bold">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 bg-[#FEF9E7] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow flex items-center justify-between">
            <div>
              <span className="text-[10px] text-foreground font-heading font-bold uppercase tracking-wider block">累计浏览总量 / VIEW COUNTS</span>
              <span className="text-4xl font-heading font-bold mt-2.5 block text-foreground select-all">
                {stats?.total_views ?? 0}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-background border-2 border-border flex items-center justify-center text-primary font-bold">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 bg-[#E8F8F5] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-foreground font-heading font-bold uppercase tracking-wider">
              <span>阅读量 Top 1 热门 / LEADER</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-border animate-pulse" />
            </div>
            <p className="text-xs font-bold text-foreground truncate mt-3 select-all">
              {stats && stats.hot_articles.length > 0 ? stats.hot_articles[0].title : '暂无'}
            </p>
            <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono font-bold">
              阅读量: {stats && stats.hot_articles.length > 0 ? stats.hot_articles[0].view_count : 0}
            </p>
          </div>
        </div>

        {/* 搜索与过滤操作条 */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
              文章发布与运营矩阵
            </h2>
            {(isLoading || isFetching) && (
              <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* 标题搜索 */}
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchTitle}
              onChange={(e) => {
                setSearchTitle(e.target.value)
                setPage(1)
              }}
              className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-44"
            />

            {/* 分类过滤 */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-muted-foreground">分类:</span>
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val || 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-28 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg focus:ring-0 font-semibold">
                  <SelectValue placeholder="显示全部" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border text-foreground rounded-lg text-xs font-semibold">
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value="行业动态">行业动态</SelectItem>
                  <SelectItem value="企业新闻">企业新闻</SelectItem>
                  <SelectItem value="产品公告">产品公告</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态过滤 */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-muted-foreground">状态:</span>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val || 'all')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-28 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg focus:ring-0 font-semibold">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border text-foreground rounded-lg text-xs font-semibold">
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
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
              className="px-4 py-2 bg-primary text-primary-foreground font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>撰写新文章 WRITE</span>
            </button>
          </div>
        </div>

        {/* 核心 Table 列表面板 */}
        <div className="border-2 border-border bg-card pop-shadow rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="h-64 flex flex-col justify-center items-center space-y-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground font-semibold">正在同步官网媒体库...</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="h-64 flex flex-col justify-center items-center text-center">
              <span className="text-xs text-muted-foreground font-semibold">暂无满足筛选条件的新闻记录</span>
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-accent border-b-2 border-border">
                <TableRow className="border-b-2 border-border hover:bg-transparent">
                  <TableHead className="font-bold text-foreground w-14">ID</TableHead>
                  <TableHead className="font-bold text-foreground w-20 text-center">置顶</TableHead>
                  <TableHead className="font-bold text-foreground w-24">封面图</TableHead>
                  <TableHead className="font-bold text-foreground">标题</TableHead>
                  <TableHead className="font-bold text-foreground w-28">分类</TableHead>
                  <TableHead className="font-bold text-foreground w-20 text-center">浏览量</TableHead>
                  <TableHead className="font-bold text-foreground w-24 text-center">状态</TableHead>
                  <TableHead className="font-bold text-foreground w-32">发布日期</TableHead>
                  <TableHead className="font-bold text-foreground w-32 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow
                    key={article.id}
                    className="border-b-2 border-border hover:bg-secondary/40 transition-colors"
                  >
                    {/* ID */}
                    <TableCell className="font-bold text-muted-foreground/80 font-mono">
                      #{article.id}
                    </TableCell>

                    {/* 置顶开关 */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleTopMutation.mutate({ id: article.id, isTopVal: !article.is_top })}
                        className="p-1 border-2 border-border bg-background rounded-lg hover:bg-accent transition-all pop-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                        title={article.is_top ? '取消置顶' : '置顶'}
                      >
                        <Star className={`h-4.5 w-4.5 ${article.is_top ? 'text-amber-500 fill-amber-400' : 'text-muted-foreground/60'}`} />
                      </button>
                    </TableCell>
                    
                    {/* 封面图 */}
                    <TableCell>
                      {article.cover_image ? (
                        <div className="w-16 h-10 border-2 border-border bg-background rounded-lg overflow-hidden flex items-center justify-center p-0.5 relative group">
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="max-w-full max-h-full object-contain rounded"
                          />
                          <a
                            href={article.cover_image}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
                          >
                            <Eye className="h-3 w-3 text-white" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 font-semibold font-mono">NO_IMG</span>
                      )}
                    </TableCell>

                    {/* 标题 */}
                    <TableCell className="font-bold text-foreground truncate max-w-xs">
                      {article.title}
                    </TableCell>

                    {/* 分类 */}
                    <TableCell>
                      <span className="px-2 py-0.5 border-2 border-border bg-background text-[10px] font-bold rounded-lg pop-shadow-sm select-none">
                        {article.category || '未分类'}
                      </span>
                    </TableCell>

                    {/* 浏览量 */}
                    <TableCell className="text-center font-bold text-muted-foreground font-mono">
                      {article.view_count}
                    </TableCell>

                    {/* 状态徽章贴纸 */}
                    <TableCell className="text-center">
                      {article.status === 'published' ? (
                        <span className="px-2.5 py-0.5 border-2 border-border bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold rounded-lg pop-shadow-sm select-none">
                          已发布
                        </span>
                      ) : article.status === 'archived' ? (
                        <span className="px-2.5 py-0.5 border-2 border-border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] font-bold rounded-lg pop-shadow-sm select-none">
                          已归档
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 border-2 border-border bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-[10px] font-bold rounded-lg pop-shadow-sm select-none">
                          草稿
                        </span>
                      )}
                    </TableCell>

                    {/* 发布日期 */}
                    <TableCell className="text-muted-foreground font-semibold text-[11px] font-mono">
                      {article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}
                    </TableCell>

                    {/* 操作 */}
                    <TableCell>
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleEditClick(article)}
                          className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                          title="编辑内容"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        
                        {/* 快捷切换发布/下线 */}
                        {article.status !== 'published' ? (
                          <button
                            onClick={() => statusMutation.mutate({ id: article.id, targetStatus: 'published' })}
                            className="px-2 py-1.5 border-2 border-border bg-emerald-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase"
                            title="立即发布"
                          >
                            发布
                          </button>
                        ) : (
                          <button
                            onClick={() => statusMutation.mutate({ id: article.id, targetStatus: 'draft' })}
                            className="px-2 py-1.5 border-2 border-border bg-amber-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase"
                            title="撤下到草稿"
                          >
                            撤回
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-destructive transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                          title="物理删除"
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
            <div className="flex items-center justify-between border-t-2 border-border p-4 bg-accent/30 text-[11px] text-muted-foreground font-semibold">
              <div>
                共计 <span className="font-bold text-foreground">{total}</span> 条数据 // 当前第{' '}
                <span className="font-bold text-foreground">{page}</span> /{' '}
                <span className="font-bold text-foreground">{totalPages}</span> 页
              </div>
              <div className="flex space-x-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3.5 py-1.5 border-2 border-border bg-background hover:bg-accent text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  上一页
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3.5 py-1.5 border-2 border-border bg-background hover:bg-accent text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 渲染表单编辑/新建视图 (大视野编辑卡片)
  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部标题横幅 */}
      <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView('list')}
            className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center justify-center"
            title="返回文章列表"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
              {view === 'edit' ? '编辑文章内容 / EDIT POST' : '撰写新文章 / WRITE POST'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">请录入文章基础信息与富文本编辑内容</p>
          </div>
        </div>

        {/* 贴纸 */}
        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3deg] hidden sm:inline-block">
          EDITOR MODE
        </div>
      </div>

      {/* 实体卡片表单 */}
      <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块：标题和富文本正文 (两列宽) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文章标题 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                文章标题 / ARTICLE TITLE
              </label>
              <input
                type="text"
                required
                placeholder="请输入文章核心标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-bold"
              />
            </div>

            {/* 摘要说明 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                文章摘要 / SUMMARY (可选)
              </label>
              <textarea
                placeholder="简明扼要地概括文章主旨..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold resize-none"
              />
            </div>

            {/* 富文本编辑器 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                文章富文本正文 / EDITORIAL CONTENT
              </label>
              <RichEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* 右侧窄块：属性元数据分类 (一列宽) */}
          <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
            <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
              属性与分发元数据 / METADATA
            </h3>

            {/* 文章分类 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground uppercase block">
                文章分类 / CATEGORY
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val || '行业动态')}>
                <SelectTrigger className="w-full h-10 bg-background border-2 border-border text-foreground text-xs rounded-lg focus:ring-0 font-bold">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border text-foreground rounded-lg text-xs font-semibold">
                  <SelectItem value="行业动态">行业动态</SelectItem>
                  <SelectItem value="企业新闻">企业新闻</SelectItem>
                  <SelectItem value="产品公告">产品公告</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 封面图 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground uppercase block">
                文章封面图 / COVER IMAGE
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="图片 URL 链接"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-[11px] font-semibold"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold flex items-center space-x-1 transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 text-[10px]"
                  >
                    {uploading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>上传</span>
                  </button>
                </div>
                {coverImage && (
                  <div className="p-1 border-2 border-border bg-background w-full h-24 rounded-lg overflow-hidden flex items-center justify-center pop-shadow-sm">
                    <img src={coverImage} alt="封面预览" className="max-w-full max-h-full object-contain rounded" />
                  </div>
                )}
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground uppercase block">
                文章标签 / TAGS
              </label>
              <input
                type="text"
                placeholder="标签用英文逗号分隔, 如: 科技, AI, 官网"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
              />
            </div>

            {/* 置顶属性 */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isTop}
                  onChange={(e) => setIsTop(e.target.checked)}
                  className="w-4 h-4 bg-background border-2 border-border text-primary focus:ring-0 rounded-md cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">
                  设置此文章置顶 (STICK TO TOP)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 提交/取消 按钮栏 */}
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
            disabled={saveMutation.isPending || uploading}
            className="px-8 py-2.5 bg-primary text-primary-foreground border-2 border-border font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            {saveMutation.isPending ? (
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
