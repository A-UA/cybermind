import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
import { ShieldAlert } from 'lucide-react'

import UserTab from './components/UserTab'
import RoleTab from './components/RoleTab'
import UserFormModal from './components/UserFormModal'
import RoleFormModal from './components/RoleFormModal'
import AssignRoleModal from './components/AssignRoleModal'
import AssignPermModal from './components/AssignPermModal'
import type { IUser, IRole, IPermission } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'

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

  // 获取用户列表
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery<{
    items: IUser[]
    total: number
  }>({
    queryKey: ['users', userPage, userSearch],
    queryFn: async () => {
      const params: any = { page: userPage, page_size: userPageSize }
      if (userSearch.trim()) params.keyword = userSearch
      const res = await apiClient.get('/users', { params })
      return res.data.data
    }
  })

  // 获取角色列表
  const { data: roles = [], isLoading: isRolesLoading, refetch: refetchRoles } = useQuery<IRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.get('/roles')
      return res.data.data
    }
  })

  // 获取所有权限字典
  const { data: permissions = [] } = useQuery<IPermission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await apiClient.get('/roles/permissions')
      return res.data.data
    }
  })

  const usersList = usersData?.items || []
  const userTotal = usersData?.total || 0

  // 保存/编辑管理员
  const saveUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedUser) {
        await apiClient.put(`/users/${selectedUser.id}`, payload)
      } else {
        await apiClient.post('/users', payload)
      }
    },
    onSuccess: () => {
      toast.success(selectedUser ? '用户信息已更新' : '创建新管理员成功')
      setIsUserModalOpen(false)
      refetchUsers()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存管理员信息失败')
    }
  })

  // 软删除管理员 (禁用)
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`)
    },
    onSuccess: () => {
      toast.success('管理员已被成功禁用(软删除)')
      refetchUsers()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '禁用操作失败')
    }
  })

  // 保存/编辑角色
  const saveRoleMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedRole) {
        await apiClient.put(`/roles/${selectedRole.id}`, payload)
      } else {
        await apiClient.post('/roles', payload)
      }
    },
    onSuccess: () => {
      toast.success(selectedRole ? '角色基本信息已修改' : '成功创建新角色')
      setIsRoleModalOpen(false)
      refetchRoles()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存角色失败')
    }
  })

  // 物理删除角色
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/roles/${id}`)
    },
    onSuccess: () => {
      toast.success('角色已成功物理删除')
      refetchRoles()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '删除角色失败')
    }
  })

  // 给管理员分配角色
  const assignRolesMutation = useMutation({
    mutationFn: async (roleIds: number[]) => {
      if (!selectedUser) return
      await apiClient.put(`/users/${selectedUser.id}/roles`, { role_ids: roleIds })
    },
    onSuccess: () => {
      toast.success('角色分配已成功更新')
      setIsAssignRoleOpen(false)
      refetchUsers()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '更新授权失败')
    }
  })

  // 给角色分配权限
  const assignPermissionsMutation = useMutation({
    mutationFn: async (permissionIds: number[]) => {
      if (!selectedRole) return
      await apiClient.put(`/roles/${selectedRole.id}/permissions`, { permission_ids: permissionIds })
    },
    onSuccess: () => {
      toast.success('角色权限配置已生效')
      setIsAssignPermOpen(false)
      refetchRoles()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '权限分配失败')
    }
  })

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
        isSaving={saveUserMutation.isPending}
        onClose={() => setIsUserModalOpen(false)}
        onSave={async (payload) => {
          await saveUserMutation.mutateAsync(payload)
        }}
      />

      <RoleFormModal
        isOpen={isRoleModalOpen}
        role={selectedRole}
        isSaving={saveRoleMutation.isPending}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={async (payload) => {
          await saveRoleMutation.mutateAsync(payload)
        }}
      />

      <AssignRoleModal
        isOpen={isAssignRoleOpen}
        user={selectedUser}
        roles={roles}
        isSaving={assignRolesMutation.isPending}
        onClose={() => setIsAssignRoleOpen(false)}
        onSave={async (roleIds) => {
          await assignRolesMutation.mutateAsync(roleIds)
        }}
      />

      <AssignPermModal
        isOpen={isAssignPermOpen}
        role={selectedRole}
        permissions={permissions}
        isSaving={assignPermissionsMutation.isPending}
        onClose={() => setIsAssignPermOpen(false)}
        onSave={async (permIds) => {
          await assignPermissionsMutation.mutateAsync(permIds)
        }}
      />

    </div>
  )
}
