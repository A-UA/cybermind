import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IRole, IPermission } from '@/types/user'

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  permissions: ['permissions'] as const,
}

export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IRole[]>>('/roles')
      return res.data.data ?? []
    },
  })
}

export function usePermissionList() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IPermission[]>>('/roles/permissions')
      return res.data.data ?? []
    },
  })
}

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

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/roles/${id}`) },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

export function useAssignPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      await apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  })
}
