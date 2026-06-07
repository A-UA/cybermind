import { Plus, Trash2, Edit, RefreshCw, Shield, Layers } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppGuard from '@/components/common/AppGuard'
import type { IRole } from '../types'

interface RoleTabProps {
  roles: IRole[]
  isLoading: boolean
  onRefetch: () => void
  onCreateRole: () => void
  onEditRole: (role: IRole) => void
  onDeleteRole: (id: number, name: string) => void
  onAssignPerm: (role: IRole) => void
}

export default function RoleTab({
  roles,
  isLoading,
  onRefetch,
  onCreateRole,
  onEditRole,
  onDeleteRole,
  onAssignPerm
}: RoleTabProps) {

  // 表格列配置
  const columns: AppTableColumn<IRole>[] = [
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
      title: '角色名称',
      key: 'name',
      width: '180px',
      render: (row) => (
        <span className="font-bold text-foreground">
          {row.name}
        </span>
      )
    },
    {
      title: '角色标识/代码',
      key: 'code',
      width: '180px',
      render: (row) => (
        <span className="font-mono text-primary font-bold">
          {row.code}
        </span>
      )
    },
    {
      title: '说明描述',
      key: 'description',
      render: (row) => (
        <span className="text-muted-foreground font-semibold">
          {row.description || '无具体说明'}
        </span>
      )
    },
    {
      title: '已配权限数',
      key: 'permissions',
      width: '110px',
      className: 'text-center',
      render: (row) => (
        <span className="px-2 py-0.5 border border-border bg-accent text-[10px] font-bold font-mono rounded-lg">
          {row.permissions.length} 个
        </span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: '180px',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center space-x-1.5">
          <AppGuard permission="role:update">
            <button
              onClick={() => onAssignPerm(row)}
              className="px-2.5 py-1 bg-[#E8F4FD] border border-border text-black font-bold text-[10px] hover:bg-accent rounded-md cursor-pointer pop-shadow-xs flex items-center space-x-1"
              title="配置角色权限"
            >
              <Layers className="h-3 w-3" />
              <span>分配权限</span>
            </button>
            <button
              onClick={() => onEditRole(row)}
              className="p-1 border border-border bg-background hover:bg-accent rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              title="修改角色"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </AppGuard>
          
          <AppGuard permission="role:delete">
            <button
              onClick={() => onDeleteRole(row.id, row.name)}
              className="p-1 border border-border bg-background hover:bg-destructive hover:text-destructive-foreground rounded-md cursor-pointer text-muted-foreground"
              title="物理删除"
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
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold text-muted-foreground">维护系统安全策略与访问粒度</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onRefetch}
            className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent pop-shadow-sm pop-press rounded-lg cursor-pointer"
            title="刷新角色"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <AppGuard permission="role:create">
            <button
              onClick={onCreateRole}
              className="px-4 py-2 bg-[#FEF9E7] text-black border-2 border-border font-heading font-bold flex items-center space-x-1.5 pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>新增角色 ADD_ROLE</span>
            </button>
          </AppGuard>
        </div>
      </div>

      {/* 表格 */}
      <AppTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        emptyText="系统内暂无任何角色条目"
      />
    </div>
  )
}
