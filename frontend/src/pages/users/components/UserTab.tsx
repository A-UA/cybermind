import { Plus, Trash2, Edit, RefreshCw, Search, Users, UserCheck, UserX } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppGuard from '@/components/common/AppGuard'
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
        <span className="font-bold text-muted-foreground/80 font-mono">
          #{row.id}
        </span>
      )
    },
    {
      title: '账户/用户名',
      key: 'username',
      render: (row) => (
        <span className="font-bold text-foreground font-mono">
          {row.username}
        </span>
      )
    },
    {
      title: '昵称',
      key: 'nickname',
      render: (row) => (
        <span className="font-semibold text-foreground">
          {row.nickname || '-'}
        </span>
      )
    },
    {
      title: '绑定的邮箱',
      key: 'email',
      render: (row) => (
        <span className="font-mono text-muted-foreground font-semibold select-all">
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
            <span className="text-[9px] text-muted-foreground/50 font-bold">无角色</span>
          ) : (
            row.roles.map((rCode) => (
              <span
                key={rCode}
                className={`px-2 py-0.5 border border-border text-[9px] font-bold rounded shadow-sm select-none ${
                  rCode === 'super_admin'
                    ? 'bg-amber-300 text-black'
                    : rCode === 'content_admin'
                    ? 'bg-blue-300 text-black'
                    : 'bg-emerald-300 text-black'
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
        <div className="flex items-center justify-center space-x-1.5 select-none">
          {row.is_active ? (
            <>
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">活动中</span>
            </>
          ) : (
            <>
              <UserX className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground/60">禁用</span>
            </>
          )}
        </div>
      )
    },
    {
      title: '授权与操作',
      key: 'actions',
      width: '180px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center space-x-1.5">
          <AppGuard permission="user:update">
            <button
              onClick={() => onAssignRole(row)}
              className="px-2 py-1 bg-[#F5EEF8] border border-border text-black font-bold text-[10px] hover:bg-accent rounded-md cursor-pointer pop-shadow-xs"
              title="修改角色分配"
            >
              授权角色
            </button>
            <button
              onClick={() => onEditUser(row)}
              className="p-1 border border-border bg-background hover:bg-accent rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              title="编辑信息"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </AppGuard>
          
          <AppGuard permission="user:delete">
            <button
              onClick={() => onDeleteUser(row.id, row.username)}
              className="p-1 border border-border bg-background hover:bg-destructive hover:text-destructive-foreground rounded-md cursor-pointer text-muted-foreground"
              title="禁用管理员"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </AppGuard>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 text-xs text-foreground font-sans">
      {/* 操作过滤条 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold text-muted-foreground">检索到 {total} 名系统运维人员</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="搜索用户名/昵称..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="px-3.5 pl-8 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold w-52 placeholder-muted-foreground/60"
            />
            <Search className="h-3.5 w-3.5 absolute left-3 text-muted-foreground/75" />
          </div>

          <button
            onClick={onRefetch}
            className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent pop-shadow-sm pop-press rounded-lg cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <AppGuard permission="user:create">
            <button
              onClick={onCreateUser}
              className="px-4 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold flex items-center space-x-1.5 pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>新增管理员 ADD_USER</span>
            </button>
          </AppGuard>
        </div>
      </div>

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
