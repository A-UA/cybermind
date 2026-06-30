import { Plus, Trash2, Edit, RefreshCw, Search } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppGuard from '@/components/common/AppGuard'
import AppButton from '@/components/common/AppButton'
import AppInput from '@/components/common/AppInput'
import AppToolbar from '@/components/common/AppToolbar'
import AppStatusBadge from '@/components/common/AppStatusBadge'
import type { IUser } from '../types'

interface UserTabProps {
  users: IUser[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean

  // 搜索
  searchQuery: string
  onSearchQueryChange: (val: string) => void
  onRefetch: () => void

  // 操作
  onCreateUser: () => void
  onEditUser: (user: IUser) => void
  onDeleteUser: (id: number, username: string) => void
  onAssignRole: (user: IUser) => void
}

export default function UserTab({
  users,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  onRefetch,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onAssignRole
}: UserTabProps) {

  // 表格列配置
  const columns: AppTableColumn<IUser>[] = [
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
      title: '账户/用户名',
      key: 'username',
      render: (row) => (
        <span className="font-mono text-foreground font-medium">
          {row.username}
        </span>
      )
    },
    {
      title: '昵称',
      key: 'nickname',
      render: (row) => (
        <span className="text-foreground">
          {row.nickname || '-'}
        </span>
      )
    },
    {
      title: '邮箱',
      key: 'email',
      render: (row) => (
        <span className="font-mono text-muted-foreground select-all">
          {row.email || '-'}
        </span>
      )
    },
    {
      title: '当前角色',
      key: 'roles',
      width: '200px',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.length === 0 ? (
            <span className="text-[11px] text-muted-foreground/50">无角色</span>
          ) : (
            row.roles.map((rCode) => (
              <span
                key={rCode}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-full select-none ${
                  rCode === 'super_admin'
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                    : rCode === 'content_admin'
                    ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {rCode}
              </span>
            ))
          )}
        </div>
      )
    },
    {
      title: '状态',
      key: 'is_active',
      width: '100px',
      className: 'text-center',
      render: (row) => (
        <AppStatusBadge tone={row.is_active ? 'success' : 'muted'} dot>
          {row.is_active ? '活动中' : '已禁用'}
        </AppStatusBadge>
      )
    },
    {
      title: '授权与操作',
      key: 'actions',
      width: '180px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <AppGuard permission="user:update">
            <AppButton
              onClick={() => onAssignRole(row)}
              size="sm"
              variant="accent"
              title="修改角色分配"
            >
              授权角色
            </AppButton>
            <AppButton
              onClick={() => onEditUser(row)}
              size="iconSm"
              variant="secondary"
              title="编辑信息"
            >
              <Edit className="h-3.5 w-3.5" strokeWidth={1.75} />
            </AppButton>
          </AppGuard>

          <AppGuard permission="user:delete">
            <AppButton
              onClick={() => onDeleteUser(row.id, row.username)}
              size="iconSm"
              variant="ghost"
              className="hover:text-destructive hover:bg-destructive/10"
              title="禁用管理员"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </AppButton>
          </AppGuard>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 text-xs text-foreground font-sans">
      {/* 操作过滤条 */}
      <AppToolbar
        icon={null}
        title={<span className="text-[13px] text-muted-foreground font-normal">检索到 {total} 名系统运维人员</span>}
        filters={
          <AppInput
            type="text"
            placeholder="搜索用户名/昵称..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" strokeWidth={1.75} />}
            className="w-52"
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              onClick={onRefetch}
              size="icon"
              variant="secondary"
              title="刷新数据"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            </AppButton>

            <AppGuard permission="user:create">
              <AppButton
                onClick={onCreateUser}
                icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
              >
                新增管理员
              </AppButton>
            </AppGuard>
          </div>
        }
      />

      {/* 表格 */}
      <AppTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        emptyText="未找到符合搜索条件的管理员"
      />
    </div>
  )
}
