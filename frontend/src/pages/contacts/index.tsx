import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
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
  Inbox,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  CheckSquare,
  X,
  Mail,
  Phone,
  Building
} from 'lucide-react'

interface IContactSubmission {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: string
  remark?: string
  processed_by?: number
  processed_by_username?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

function StatCard({
  title,
  value,
  label,
  bgColorClass = 'bg-card',
  statusColor = 'bg-primary'
}: {
  title: string
  value: string | number
  label: string
  bgColorClass?: string
  statusColor?: string
}) {
  return (
    <div className={`p-6 ${bgColorClass} border-2 border-border rounded-xl pop-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)] transition-all duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between text-[11px] text-foreground font-heading tracking-wider uppercase font-bold">
        <span>{title}</span>
        <span className={`w-3 h-3 rounded-full border-2 border-border ${statusColor}`} />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-4xl font-heading font-bold tracking-tight text-foreground select-all">{value}</span>
        <span className="text-[10px] text-muted-foreground font-semibold tracking-wider font-mono">{label}</span>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubmission, setActiveSubmission] = useState<IContactSubmission | null>(null)

  // 客服处理意见表单状态
  const [remarkText, setRemarkText] = useState('')
  const [processStatus, setProcessStatus] = useState('processed')

  // 1. 获取分页留言列表
  const { data, isLoading, refetch } = useQuery<{
    items: IContactSubmission[]
    total: number
  }>({
    queryKey: ['contact-submissions', page, pageSize, statusFilter, searchQuery],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize }
      if (statusFilter) params.status = statusFilter
      if (searchQuery.trim()) params.query = searchQuery
      const res = await apiClient.get('/contact-submissions', { params })
      return res.data.data
    }
  })

  // 2. 局部统计 - 查询未读、已读、已处理、全部的数量
  const { data: countUnread = 0, refetch: refetchUnread } = useQuery<number>({
    queryKey: ['contacts-count-unread'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { status: 'unread', page_size: 1 } })
      return res.data.data.total
    }
  })

  const { data: countRead = 0, refetch: refetchRead } = useQuery<number>({
    queryKey: ['contacts-count-read'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { status: 'read', page_size: 1 } })
      return res.data.data.total
    }
  })

  const { data: countProcessed = 0, refetch: refetchProcessed } = useQuery<number>({
    queryKey: ['contacts-count-processed'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { status: 'processed', page_size: 1 } })
      return res.data.data.total
    }
  })

  const submissions = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const refetchCounts = () => {
    refetchUnread()
    refetchRead()
    refetchProcessed()
  }

  // 3. 详情获取并标记已读 Mutation
  const detailQueryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.get(`/contact-submissions/${id}`)
      return res.data.data
    },
    onSuccess: (updatedSub: IContactSubmission) => {
      setActiveSubmission(updatedSub)
      setRemarkText(updatedSub.remark || '')
      setProcessStatus(updatedSub.status === 'processed' ? 'processed' : 'processed')
      refetch()
      refetchCounts()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '加载详情失败')
    }
  })

  // 4. 处理并归档 Mutation
  const processMutation = useMutation({
    mutationFn: async ({ id, remark, status }: { id: number; remark: string; status: string }) => {
      const res = await apiClient.put(`/contact-submissions/${id}/process`, { remark, status })
      return res.data.data
    },
    onSuccess: (updatedSub: IContactSubmission) => {
      toast.success('留言已成功处理并归档')
      setActiveSubmission(updatedSub)
      refetch()
      refetchCounts()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '留言处理失败')
    }
  })

  // 5. 物理删除 Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/contact-submissions/${id}`)
    },
    onSuccess: () => {
      toast.success('留言记录已成功物理清除')
      setActiveSubmission(null)
      refetch()
      refetchCounts()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '留言删除失败')
    }
  })

  const handleRowClick = (id: number) => {
    detailQueryMutation.mutate(id)
  }

  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSubmission) return
    if (!remarkText.trim()) {
      toast.error('处理备注批注内容不能为空')
      return
    }
    processMutation.mutate({
      id: activeSubmission.id,
      remark: remarkText,
      status: processStatus
    })
  }

  const handleDeleteClick = (id: number) => {
    if (window.confirm('确认要物理擦除此条留言吗？此操作无法撤销。')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-8 text-foreground font-sans">
      
      {/* 顶部三个实体撞色指标卡纸 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="未读留言数 // UNREAD_CONTACTS"
          value={countUnread}
          label="亟待客服审阅"
          bgColorClass="bg-[#FEF9E7] dark:bg-[#1E293B]"
          statusColor={countUnread > 0 ? 'bg-amber-400 animate-pulse' : 'bg-muted-foreground/40'}
        />
        <StatCard
          title="已阅待处理 // READ_PENDING"
          value={countRead}
          label="已查看未归档"
          bgColorClass="bg-[#E8F4FD] dark:bg-[#1E293B]"
          statusColor={countRead > 0 ? 'bg-primary' : 'bg-muted-foreground/40'}
        />
        <StatCard
          title="已处理归档 // ARCHIVED_RESOLVED"
          value={countProcessed}
          label="客服妥善批复"
          bgColorClass="bg-[#E8F8F5] dark:bg-[#1E293B]"
          statusColor="bg-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* 左侧：分类状态过滤器栏 (拼色薰衣草紫) */}
        <div className="xl:col-span-1 bg-[#F5EEF8] dark:bg-[#1E293B] border-2 border-border rounded-xl p-5 pop-shadow space-y-4">
          <h3 className="text-xs font-heading font-bold text-foreground flex items-center space-x-1.5 border-b-2 border-border pb-3 select-none">
            <Inbox className="h-4 w-4 text-primary" />
            <span>收件分类 // FILTER</span>
          </h3>

          <div className="flex flex-col space-y-2 text-xs">
            <button
              onClick={() => { setStatusFilter(''); setPage(1) }}
              className={`w-full text-left px-3 py-2.5 font-bold rounded-lg border-2 transition-all flex items-center justify-between ${
                statusFilter === ''
                  ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                  : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
              }`}
            >
              <span>全部收件箱 (ALL)</span>
              <span className="font-mono bg-accent/20 border border-border/20 px-1.5 py-0.5 rounded text-[10px]">{countUnread + countRead + countProcessed}</span>
            </button>

            <button
              onClick={() => { setStatusFilter('unread'); setPage(1) }}
              className={`w-full text-left px-3 py-2.5 font-bold rounded-lg border-2 transition-all flex items-center justify-between ${
                statusFilter === 'unread'
                  ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                  : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
              }`}
            >
              <span>未读邮件 (UNREAD)</span>
              <span className="font-mono bg-amber-400/20 text-amber-600 border border-amber-400/30 px-1.5 py-0.5 rounded text-[10px]">{countUnread}</span>
            </button>

            <button
              onClick={() => { setStatusFilter('read'); setPage(1) }}
              className={`w-full text-left px-3 py-2.5 font-bold rounded-lg border-2 transition-all flex items-center justify-between ${
                statusFilter === 'read'
                  ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                  : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
              }`}
            >
              <span>已读留言 (READ)</span>
              <span className="font-mono bg-blue-400/20 text-blue-600 border border-blue-400/30 px-1.5 py-0.5 rounded text-[10px]">{countRead}</span>
            </button>

            <button
              onClick={() => { setStatusFilter('processed'); setPage(1) }}
              className={`w-full text-left px-3 py-2.5 font-bold rounded-lg border-2 transition-all flex items-center justify-between ${
                statusFilter === 'processed'
                  ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                  : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
              }`}
            >
              <span>已处理归档 (PROCESSED)</span>
              <span className="font-mono bg-emerald-400/20 text-emerald-600 border border-emerald-400/30 px-1.5 py-0.5 rounded text-[10px]">{countProcessed}</span>
            </button>
          </div>
        </div>

        {/* 右侧：主件箱数据表格 */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* 操作过滤栏 */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
            <div className="flex items-center space-x-2.5">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-heading font-bold tracking-wider uppercase">
                客服收件箱留言管理
              </h2>
              {isLoading && (
                <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* 搜索 */}
              <input
                type="text"
                placeholder="搜索姓名/邮箱/主题..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-52"
              />

              <button
                onClick={() => { refetch(); refetchCounts() }}
                className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                title="刷新信箱"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 表格内容 */}
          <div className="border-2 border-border bg-card pop-shadow rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="h-64 flex flex-col justify-center items-center space-y-3">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold">正在同步您的收件箱...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="h-64 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-muted-foreground font-semibold">信箱中暂无符合条件的留言条目</span>
              </div>
            ) : (
              <Table className="text-xs">
                <TableHeader className="bg-accent border-b-2 border-border">
                  <TableRow className="border-b-2 border-border hover:bg-transparent">
                    <TableHead className="font-bold text-foreground w-12">ID</TableHead>
                    <TableHead className="font-bold text-foreground w-32">留言人</TableHead>
                    <TableHead className="font-bold text-foreground">主题 Subject</TableHead>
                    <TableHead className="font-bold text-foreground w-32">提交时间</TableHead>
                    <TableHead className="font-bold text-foreground w-24 text-center">状态</TableHead>
                    <TableHead className="font-bold text-foreground w-16 text-center">详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow
                      key={sub.id}
                      onClick={() => handleRowClick(sub.id)}
                      className={`border-b-2 border-border hover:bg-secondary/40 transition-colors cursor-pointer ${sub.status === 'unread' ? 'font-bold bg-accent/10' : ''}`}
                    >
                      {/* ID */}
                      <TableCell className="font-mono text-muted-foreground font-bold">
                        #{sub.id}
                      </TableCell>

                      {/* 留言人 */}
                      <TableCell className="truncate max-w-[120px]">
                        <div className="flex flex-col">
                          <span className="text-foreground font-bold">{sub.name}</span>
                          <span className="text-[10px] text-muted-foreground select-all font-mono">{sub.email}</span>
                        </div>
                      </TableCell>

                      {/* 主题 */}
                      <TableCell className="truncate max-w-xs font-semibold text-foreground">
                        {sub.subject}
                      </TableCell>

                      {/* 提交时间 */}
                      <TableCell className="text-muted-foreground font-mono font-semibold">
                        {sub.created_at ? new Date(sub.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}
                      </TableCell>

                      {/* 状态贴纸 */}
                      <TableCell className="text-center">
                        {sub.status === 'unread' && (
                          <span className="px-2 py-0.5 border-2 border-border bg-[#FEF9E7] text-black font-bold text-[9px] rounded-lg pop-shadow-sm">
                            未读
                          </span>
                        )}
                        {sub.status === 'read' && (
                          <span className="px-2 py-0.5 border-2 border-border bg-[#E8F4FD] text-black font-bold text-[9px] rounded-lg pop-shadow-sm">
                            已阅
                          </span>
                        )}
                        {sub.status === 'processed' && (
                          <span className="px-2 py-0.5 border-2 border-border bg-emerald-300 text-black font-bold text-[9px] rounded-lg pop-shadow-sm">
                            已处理
                          </span>
                        )}
                      </TableCell>

                      {/* 查看按钮 */}
                      <TableCell className="text-center">
                        <button className="p-1 border border-border bg-background hover:bg-accent rounded-md">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 分页控制 (新野兽派实体框) */}
            {totalPages > 1 && (
              <div className="p-4 border-t-2 border-border flex items-center justify-between text-xs bg-accent/20">
                <span className="font-semibold text-muted-foreground">
                  共 {total} 条留言，当前第 {page} / {totalPages} 页
                </span>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 border-2 border-border bg-background font-bold rounded-lg pop-shadow-sm pop-press disabled:opacity-40 cursor-pointer"
                  >
                    上一页
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 border-2 border-border bg-background font-bold rounded-lg pop-shadow-sm pop-press disabled:opacity-40 cursor-pointer"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧滑出硬板纸抽屉详情面板 (查看与处理回复) */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-card border-l-4 border-border w-full max-w-xl h-full flex flex-col justify-between pop-shadow-lg overflow-y-auto">
            
            {/* 抽屉顶部头部 */}
            <div className="p-5 bg-accent border-b-4 border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">留言详细查阅</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">留言ID: #{activeSubmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-1.5 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 抽屉滚动内容 */}
            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
              
              {/* 留言主题 */}
              <div className="bg-[#FEF9E7] border-2 border-border p-4 rounded-xl pop-shadow-sm space-y-1">
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-muted-foreground">主题 // SUBJECT</span>
                <h4 className="font-bold text-sm text-foreground select-all">{activeSubmission.subject}</h4>
              </div>

              {/* 留言正文 (巨大色块) */}
              <div className="bg-[#E8F4FD] border-2 border-border p-5 rounded-xl pop-shadow-sm space-y-2.5">
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-muted-foreground">留言正文 // MESSAGE_BODY</span>
                <p className="text-foreground text-xs leading-relaxed font-semibold whitespace-pre-wrap select-all">
                  {activeSubmission.message}
                </p>
              </div>

              {/* 留言人详情元数据 */}
              <div className="bg-background border-2 border-border rounded-xl p-5 space-y-4">
                <h4 className="text-[10px] font-heading font-bold uppercase tracking-wider border-b border-border/40 pb-2 text-foreground">
                  留言人登记信息 // VISITOR METADATA
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Inbox className="h-3 w-3 mr-1" />姓名</span>
                    <span className="font-bold text-foreground select-all">{activeSubmission.name}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Mail className="h-3 w-3 mr-1" />电子邮箱</span>
                    <span className="font-bold text-foreground select-all font-mono">{activeSubmission.email}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Phone className="h-3 w-3 mr-1" />联系电话</span>
                    <span className="font-bold text-foreground select-all font-mono">{activeSubmission.phone || '未填写'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Building className="h-3 w-3 mr-1" />所属公司</span>
                    <span className="font-bold text-foreground select-all">{activeSubmission.company || '未填写'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/20 text-[10px] text-muted-foreground font-semibold flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>提交于: {activeSubmission.created_at ? new Date(activeSubmission.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</span>
                </div>
              </div>

              {/* 批注回复历史 (若已处理) */}
              {activeSubmission.status === 'processed' && (
                <div className="bg-emerald-400/10 border-2 border-emerald-500/30 p-5 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-heading font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider select-none">
                    处理归档意见 // ARCHIVED REMARKS
                  </h4>
                  <div className="text-xs space-y-2 text-foreground font-semibold">
                    <p className="whitespace-pre-wrap bg-background p-3 rounded-lg border border-emerald-500/20">{activeSubmission.remark}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>处理人: {activeSubmission.processed_by_username || `ID #${activeSubmission.processed_by}`}</span>
                      <span>时间: {activeSubmission.processed_at ? new Date(activeSubmission.processed_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 留言处理批注表单 (不论状态均可编辑与追加备注) */}
              <form onSubmit={handleProcessSubmit} className="bg-accent/20 border-2 border-border p-5 rounded-xl space-y-4">
                <h4 className="text-[10px] font-heading font-bold text-foreground uppercase tracking-wider select-none">
                  客服处理与批注 // RESOLUTION ACTION
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold block">
                      批注内容 / REMARK COMMENTS
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="请录入处理意见或批注归档说明..."
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold resize-y"
                    />
                  </div>

                  <div className="flex items-center space-x-6 text-xs">
                    <label className="inline-flex items-center space-x-2 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="processStatus"
                        value="processed"
                        checked={processStatus === 'processed'}
                        onChange={() => setProcessStatus('processed')}
                        className="w-4 h-4 text-primary bg-background border-2 border-border focus:ring-0 cursor-pointer"
                      />
                      <span>处理完毕归档 (PROCESSED)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={processMutation.isPending}
                    className="w-full py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider rounded-lg pop-shadow-sm pop-press flex items-center justify-center space-x-1.5"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>{processMutation.isPending ? '正在处理...' : '确认归档备注 SAVE & RESOLVE'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 抽屉底部操作区 */}
            <div className="p-4 bg-accent border-t-4 border-border flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteClick(activeSubmission.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 border-2 border-border bg-background hover:bg-destructive hover:text-destructive-foreground font-heading font-bold text-xs rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center space-x-1.5 text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
                <span>物理擦除 REMOVE</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="px-5 py-2 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold text-xs rounded-lg pop-shadow-sm pop-press cursor-pointer"
              >
                关闭 CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
