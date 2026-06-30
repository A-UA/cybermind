import { Plus, Trash2, Edit, RefreshCw, Layers } from 'lucide-react'
import AppTable from '@/components/common/AppTable'
import type { AppTableColumn } from '@/components/common/AppTable'
import AppGuard from '@/components/common/AppGuard'
import AppButton from '@/components/common/AppButton'
import AppToolbar from '@/components/common/AppToolbar'
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
        <span className="font-mono text-muted-foreground">
          #{row.id}
        </span>
      )
    },
    {
      title: '角色名称',
      key: 'name',
      width: '180px',
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.name}
        </span>
      )
    },
    {
      title: '角色标识/代码',
      key: 'code',
      width: '180px',
      render: (row) => (
        <span className="font-mono text-primary font-medium">
          {row.code}
        </span>
      )
    },
    {
      title: '说明描述',
      key: 'description',
      render: (row) => (
        <span className="text-muted-foreground">
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
        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[11px] font-mono rounded-full font-medium">
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
        <div className="flex items-center justify-center gap-1.5">
          <AppGuard permission="role:update">
            <AppButton
              onClick={() => onAssignPerm(row)}
              size="sm"
              variant="accent"
              icon={<Layers className="h-3 w-3" strokeWidth={1.75} />}
              title="配置角色权限"
            >
              分配权限
            </AppButton>
            <AppButton
              onClick={() => onEditRole(row)}
              size="iconSm"
              variant="secondary"
              title="修改角色"
            >
              <Edit className="h-3.5 w-3.5" strokeWidth={1.75} />
            </AppButton>
          </AppGuard>

          <AppGuard permission="role:delete">
            <AppButton
              onClick={() => onDeleteRole(row.id, row.name)}
              size="iconSm"
              variant="ghost"
              className="hover:text-destructive hover:bg-destructive/10"
              title="物理删除"
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
        title={<span className="text-[13px] text-muted-foreground font-normal">维护系统安全策略与访问权限</span>}
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              onClick={onRefetch}
              size="icon"
              variant="secondary"
              title="刷新角色"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            </AppButton>

            <AppGuard permission="role:create">
              <AppButton
                onClick={onCreateRole}
                icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
              >
                新增角色
              </AppButton>
            </AppGuard>
          </div>
        }
      />

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
