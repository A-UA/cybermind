import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { IUser, IRole, IPermission } from '@/types/user'

export const userKeys = {
  all: ['users'] as const,
  list: (page: number, keyword?: string) => [...userKeys.all, page, keyword] as const,
}

export const roleKeys = {
  all: ['roles'] as const,
  permissions: ['permissions'] as const,
}

/** 获取用户列表 */
export function useUserList(params: { page: number; page_size: number; keyword?: string }) {
  return useQuery({
    queryKey: userKeys.list(params.page, params.keyword),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IUser>>>('/users', { params })
      return res.data.data
    },
  })
}

/** 获取角色列表 */
export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IRole[]>>('/roles')
      return res.data.data
    },
  })
}

/** 获取所有权限字典 */
export function usePermissionList() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IPermission[]>>('/roles/permissions')
      return res.data.data
    },
  })
}

/** 创建用户 */
export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<IUser> & { password?: string }) => {
      const res = await apiClient.post<ApiResponse<IUser>>('/users', payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

/** 更新用户 */
export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<IUser> & { password?: string } }) => {
      const res = await apiClient.put<ApiResponse<IUser>>(`/users/${id}`, payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

/** 禁用用户（软删除） */
export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

/** 创建角色 */
export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<IRole>) => {
      const res = await apiClient.post<ApiResponse<IRole>>('/roles', payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

/** 更新角色 */
export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<IRole> }) => {
      const res = await apiClient.put<ApiResponse<IRole>>(`/roles/${id}`, payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

/** 删除角色 */
export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/roles/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

/** 给用户分配角色 */
export function useAssignRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: number; roleIds: number[] }) => {
      await apiClient.put(`/users/${userId}/roles`, { role_ids: roleIds })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

/** 给角色分配权限 */
export function useAssignPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      await apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}
