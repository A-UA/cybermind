import { Inbox, Eye, RefreshCw, Mail } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppTime from '@/components/common/AppTime'
import type { IContactSubmission } from '../types'

interface ContactListProps {
  submissions: IContactSubmission[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  
  // 统计数据
  countUnread: number
  countRead: number
  countProcessed: number
  
  // 过滤与搜索
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onRefetch: () => void
  
  // 操作
  onRowClick: (id: number) => void
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

export default function ContactList({
  submissions,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
  countUnread,
  countRead,
  countProcessed,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onRefetch,
  onRowClick
}: ContactListProps) {

  // 表格列配置
  const columns: AppTableColumn<IContactSubmission>[] = [
    {
      title: 'ID',
      key: 'id',
      width: '70px',
      render: (row) => (
        <span className="font-mono text-muted-foreground font-bold">
          #{row.id}
        </span>
      )
    },
    {
      title: '留言人',
      key: 'name',
      width: '180px',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-foreground font-bold">{row.name}</span>
          <span className="text-[10px] text-muted-foreground select-all font-mono">{row.email}</span>
        </div>
      )
    },
    {
      title: '主题 Subject',
      key: 'subject',
      render: (row) => (
        <span className={`font-semibold text-foreground truncate block max-w-xs ${row.status === 'unread' ? 'font-black' : ''}`}>
          {row.subject}
        </span>
      )
    },
    {
      title: '提交时间',
      key: 'created_at',
      width: '150px',
      render: (row) => (
        <div className="text-muted-foreground font-mono font-semibold">
          <AppTime value={row.created_at} format="YYYY-MM-DD HH:mm" />
        </div>
      )
    },
    {
      title: '状态',
      key: 'status',
      width: '100px',
      className: 'text-center',
      render: (row) => {
        if (row.status === 'unread') {
          return (
            <span className="px-2 py-0.5 border-2 border-border bg-[#FEF9E7] text-black font-bold text-[9px] rounded-lg pop-shadow-sm select-none">
              未读
            </span>
          )
        }
        if (row.status === 'read') {
          return (
            <span className="px-2 py-0.5 border-2 border-border bg-[#E8F4FD] text-black font-bold text-[9px] rounded-lg pop-shadow-sm select-none">
              已阅
            </span>
          )
        }
        return (
          <span className="px-2 py-0.5 border-2 border-border bg-emerald-300 text-black font-bold text-[9px] rounded-lg pop-shadow-sm select-none">
            已处理
          </span>
        )
      }
    },
    {
      title: '详情',
      key: 'actions',
      width: '70px',
      className: 'text-center',
      render: (row) => (
        <button 
          onClick={() => onRowClick(row.id)}
          className="p-1 border border-border bg-background hover:bg-accent rounded-md cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )
    }
  ]

  return (
    <div className="space-y-8 text-foreground font-sans text-xs">
      
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
              onClick={() => onStatusFilterChange('')}
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
              onClick={() => onStatusFilterChange('unread')}
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
              onClick={() => onStatusFilterChange('read')}
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
              onClick={() => onStatusFilterChange('processed')}
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
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-52"
              />

              <button
                onClick={onRefetch}
                className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                title="刷新信箱"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 表格内容 */}
          <AppTable
            columns={columns}
            data={submissions}
            isLoading={isLoading}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={onPageChange}
            emptyText="信箱中暂无符合条件的留言条目"
          />
        </div>
      </div>
    </div>
  )
}
