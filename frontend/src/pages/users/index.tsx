import { useState } from 'react'
import { toast } from 'sonner'
import { ShieldAlert } from 'lucide-react'

import UserTab from './components/UserTab'
import RoleTab from './components/RoleTab'
import UserFormModal from './components/UserFormModal'
import RoleFormModal from './components/RoleFormModal'
import AssignRoleModal from './components/AssignRoleModal'
import AssignPermModal from './components/AssignPermModal'
import type { IUser, IRole } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'
import {
  useUserList,
  useRoleList,
  usePermissionList,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignRoles,
  useAssignPermissions,
} from '@/queries/useUserQuery'

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
  const [userPage, setUserPage] = useState(1)
  const [userPageSize] = useState(15)
  const [userSearch, setUserSearch] = useState('')

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null)

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [isAssignPermOpen, setIsAssignPermOpen] = useState(false)
  const { showConfirm } = useConfirmStore()

  // ==================== 1. API 数据拉取 ====================

  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useUserList({
    page: userPage,
    page_size: userPageSize,
    keyword: userSearch.trim() || undefined,
  })

  const { data: roles = [], isLoading: isRolesLoading, refetch: refetchRoles } = useRoleList()
  const { data: permissions = [] } = usePermissionList()

  const usersList = usersData?.items || []
  const userTotal = usersData?.total || 0

  // ==================== 2. API Mutations ====================

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()
  const deleteRoleMutation = useDeleteRole()
  const assignRolesMutation = useAssignRoles()
  const assignPermissionsMutation = useAssignPermissions()

  const isSavingUser = createUserMutation.isPending || updateUserMutation.isPending
  const isSavingRole = createRoleMutation.isPending || updateRoleMutation.isPending

  // ==================== 3. 页面渲染逻辑 ====================

  return (
    <div className="space-y-6 text-foreground font-sans">

      {/* 顶部控制栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl text-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider uppercase">
              管理员与 RBAC 权限配置中心
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 font-mono">
              SYSTEM_ADMIN_RBAC_CONTROL_UNIT
            </p>
          </div>
        </div>

        {/* 撞色选项卡按钮组 */}
        <div className="flex bg-accent/40 border-2 border-border p-1 rounded-lg max-w-fit font-heading font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-primary text-primary-foreground pop-shadow-sm border border-border scale-[1.02]' : 'text-foreground hover:bg-accent/40'
            }`}
          >
            管理员管理
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'roles' ? 'bg-primary text-primary-foreground pop-shadow-sm border border-border scale-[1.02]' : 'text-foreground hover:bg-accent/40'
            }`}
          >
            角色与权限
          </button>
        </div>
      </div>

      {/* 选项卡内容区 */}
      {activeTab === 'users' ? (
        <UserTab
          users={usersList}
          total={userTotal}
          page={userPage}
          pageSize={userPageSize}
          onPageChange={setUserPage}
          isLoading={isUsersLoading}
          searchQuery={userSearch}
          onSearchQueryChange={setUserSearch}
          onRefetch={refetchUsers}
          onCreateUser={() => {
            setSelectedUser(null)
            setIsUserModalOpen(true)
          }}
          onEditUser={(u) => {
            setSelectedUser(u)
            setIsUserModalOpen(true)
          }}
          onDeleteUser={(id, username) => {
            showConfirm({
              title: '确认禁用',
              message: `确认要禁用管理员 ${username} 吗？`,
              onConfirm: async () => {
                await deleteUserMutation.mutateAsync(id)
                toast.success('管理员已被成功禁用(软删除)')
              }
            })
          }}
          onAssignRole={(u) => {
            setSelectedUser(u)
            setIsAssignRoleOpen(true)
          }}
        />
      ) : (
        <RoleTab
          roles={roles}
          isLoading={isRolesLoading}
          onRefetch={refetchRoles}
          onCreateRole={() => {
            setSelectedRole(null)
            setIsRoleModalOpen(true)
          }}
          onEditRole={(r) => {
            setSelectedRole(r)
            setIsRoleModalOpen(true)
          }}
          onDeleteRole={(id, name) => {
            showConfirm({
              title: '确认删除',
              message: `确定要物理删除角色 [${name}] 吗？`,
              onConfirm: async () => {
                await deleteRoleMutation.mutateAsync(id)
                toast.success('角色已成功物理删除')
              }
            })
          }}
          onAssignPerm={(r) => {
            setSelectedRole(r)
            setIsAssignPermOpen(true)
          }}
        />
      )}

      {/* 弹窗组件挂载 */}
      <UserFormModal
        isOpen={isUserModalOpen}
        user={selectedUser}
        isSaving={isSavingUser}
        onClose={() => setIsUserModalOpen(false)}
        onSave={async (payload) => {
          if (selectedUser) {
            await updateUserMutation.mutateAsync({ id: selectedUser.id, payload })
            toast.success('用户信息已更新')
          } else {
            await createUserMutation.mutateAsync(payload)
            toast.success('创建新管理员成功')
          }
          setIsUserModalOpen(false)
        }}
      />

      <RoleFormModal
        isOpen={isRoleModalOpen}
        role={selectedRole}
        isSaving={isSavingRole}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={async (payload) => {
          if (selectedRole) {
            await updateRoleMutation.mutateAsync({ id: selectedRole.id, payload })
            toast.success('角色基本信息已修改')
          } else {
            await createRoleMutation.mutateAsync(payload)
            toast.success('成功创建新角色')
          }
          setIsRoleModalOpen(false)
        }}
      />

      <AssignRoleModal
        isOpen={isAssignRoleOpen}
        user={selectedUser}
        roles={roles}
        isSaving={assignRolesMutation.isPending}
        onClose={() => setIsAssignRoleOpen(false)}
        onSave={async (roleIds) => {
          if (!selectedUser) return
          await assignRolesMutation.mutateAsync({ userId: selectedUser.id, roleIds })
          toast.success('角色分配已成功更新')
          setIsAssignRoleOpen(false)
        }}
      />

      <AssignPermModal
        isOpen={isAssignPermOpen}
        role={selectedRole}
        permissions={permissions}
        isSaving={assignPermissionsMutation.isPending}
        onClose={() => setIsAssignPermOpen(false)}
        onSave={async (permIds) => {
          if (!selectedRole) return
          await assignPermissionsMutation.mutateAsync({ roleId: selectedRole.id, permissionIds: permIds })
          toast.success('角色权限配置已生效')
          setIsAssignPermOpen(false)
        }}
      />

    </div>
  )
}
