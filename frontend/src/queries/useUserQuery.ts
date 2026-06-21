import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { IUser } from '@/types/user'

export const userKeys = {
  all: ['users'] as const,
  list: (params?: Record<string, unknown>) => [...userKeys.all, 'list', params] as const,
}

export function useUserList(params: { page: number; page_size: number; keyword?: string }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IUser>>>('/users', { params })
      return res.data.data
    },
  })
}

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

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/users/${id}`) },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useAssignRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: number; roleIds: number[] }) => {
      await apiClient.put(`/users/${userId}/roles`, { role_ids: roleIds })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
