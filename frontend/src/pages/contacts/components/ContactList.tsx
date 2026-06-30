import { Inbox, Eye, RefreshCw, Mail } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppTime from '@/components/common/AppTime'
import AppStatsCard from '@/components/common/AppStatsCard'
import AppToolbar from '@/components/common/AppToolbar'
import AppInput from '@/components/common/AppInput'
import AppButton from '@/components/common/AppButton'
import AppStatusBadge from '@/components/common/AppStatusBadge'
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
        <span className="font-mono text-muted-foreground">
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
          <span className="text-foreground font-medium">{row.name}</span>
          <span className="text-[11px] text-muted-foreground select-all font-mono mt-0.5">{row.email}</span>
        </div>
      )
    },
    {
      title: '主题',
      key: 'subject',
      render: (row) => (
        <span className={`text-foreground truncate block max-w-xs ${row.status === 'unread' ? 'font-semibold' : 'text-muted-foreground'}`}>
          {row.subject}
        </span>
      )
    },
    {
      title: '提交时间',
      key: 'created_at',
      width: '150px',
      render: (row) => (
        <div className="text-muted-foreground font-mono text-[11px]">
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
          return <AppStatusBadge tone="warning" dot>未读</AppStatusBadge>
        }
        if (row.status === 'read') {
          return <AppStatusBadge tone="info" dot>已阅</AppStatusBadge>
        }
        return <AppStatusBadge tone="success" dot>已处理</AppStatusBadge>
      }
    },
    {
      title: '详情',
      key: 'actions',
      width: '70px',
      className: 'text-center',
      render: (row) => (
        <div className="flex justify-center">
          <AppButton
            onClick={() => onRowClick(row.id)}
            size="iconSm"
            variant="secondary"
            title="查看详情"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          </AppButton>
        </div>
      )
    }
  ]

  const totalCount = countUnread + countRead + countProcessed

  return (
    <div className="space-y-6 text-foreground font-sans text-xs">

      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AppStatsCard
          title="未读留言数"
          value={countUnread}
          label="亟待客服审阅"
          icon={<Mail className="h-5 w-5" strokeWidth={1.5} />}
          accentColor={countUnread > 0 ? 'var(--destructive)' : 'var(--border)'}
        />
        <AppStatsCard
          title="已阅待处理"
          value={countRead}
          label="已查看未归档"
          icon={<Inbox className="h-5 w-5" strokeWidth={1.5} />}
          accentColor={countRead > 0 ? 'var(--primary)' : 'var(--border)'}
        />
        <AppStatsCard
          title="已处理归档"
          value={countProcessed}
          label="已归档批复"
          icon={<Inbox className="h-5 w-5" strokeWidth={1.5} />}
          accentColor="var(--chart-2)"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* 左侧：分类状态过滤器栏 */}
        <div className="xl:col-span-1 bg-card rounded-2xl p-5 elevation-1 space-y-4">
          <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3 select-none">
            <Inbox className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <span>收件箱分类</span>
          </h3>

          <div className="flex flex-col gap-1 text-[13px]">
            <button
              onClick={() => onStatusFilterChange('')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                statusFilter === ''
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span>全部收件箱</span>
              <span className="font-mono bg-accent text-[11px] px-2 py-0.5 rounded-full">{totalCount}</span>
            </button>

            <button
              onClick={() => onStatusFilterChange('unread')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                statusFilter === 'unread'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span>未读邮件</span>
              <span className="font-mono bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full text-[11px] font-medium">{countUnread}</span>
            </button>

            <button
              onClick={() => onStatusFilterChange('read')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                statusFilter === 'read'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span>已读留言</span>
              <span className="font-mono bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full text-[11px] font-medium">{countRead}</span>
            </button>

            <button
              onClick={() => onStatusFilterChange('processed')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                statusFilter === 'processed'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span>已处理归档</span>
              <span className="font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[11px] font-medium">{countProcessed}</span>
            </button>
          </div>
        </div>

        {/* 右侧：主件箱数据表格 */}
        <div className="xl:col-span-3 space-y-6">
          {/* 操作过滤栏 */}
          <AppToolbar
            icon={<Mail className="h-5 w-5 text-primary" strokeWidth={1.75} />}
            title="客服收件箱留言管理"
            loading={isLoading}
            filters={
              <AppInput
                type="text"
                placeholder="搜索姓名/邮箱/主题..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-52"
              />
            }
            actions={
              <AppButton
                onClick={onRefetch}
                size="icon"
                variant="secondary"
                title="刷新信箱"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
              </AppButton>
            }
          />

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
