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
import AppToolbar from '@/components/common/AppToolbar'
import AppTabs from '@/components/common/AppTabs'
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

  const { data: rolesData, isLoading: isRolesLoading, refetch: refetchRoles } = useRoleList()
  const roles = rolesData ?? []
  const { data: permissionsData } = usePermissionList()
  const permissions = permissionsData ?? []

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
      <AppToolbar
        icon={<ShieldAlert className="h-5 w-5 text-primary" strokeWidth={1.75} />}
        title="管理员与 RBAC 权限配置中心"
        actions={
          <AppTabs
            value={activeTab}
            onValueChange={setActiveTab}
            options={[
              { value: 'users', label: '管理员管理' },
              { value: 'roles', label: '角色与权限' },
            ]}
          />
        }
      />

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
                toast.success('管理员已被成功禁用')
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
            await updateUserMutation.mutateAsync({ id: selectedUser.id, payload: payload as Partial<IUser> & { password?: string } })
            toast.success('用户信息已更新')
          } else {
            await createUserMutation.mutateAsync(payload as Partial<IUser> & { password?: string })
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
            await updateRoleMutation.mutateAsync({ id: selectedRole.id, payload: payload as Partial<IRole> })
            toast.success('角色基本信息已修改')
          } else {
            await createRoleMutation.mutateAsync(payload as Partial<IRole>)
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
