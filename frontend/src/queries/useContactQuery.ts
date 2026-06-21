import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { IContactSubmission } from '@/types/contact'

export const contactKeys = {
  all: ['contact-submissions'] as const,
  list: (params?: Record<string, unknown>) => [...contactKeys.all, 'list', params] as const,
  detail: (id: number) => [...contactKeys.all, 'detail', id] as const,
  count: (status: string) => [...contactKeys.all, 'count', status] as const,
}

export function useContactList(params: {
  page: number; page_size: number; status?: string; query?: string
}) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>('/contact-submissions', { params })
      return res.data.data
    },
  })
}

export function useContactCount(status: string) {
  return useQuery({
    queryKey: contactKeys.count(status),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>('/contact-submissions', {
        params: { status, page_size: 1 },
      })
      return res.data.data?.total ?? 0
    },
  })
}

export function useContactDetail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.get<ApiResponse<IContactSubmission>>(`/contact-submissions/${id}`)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

export function useProcessContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, remark, status }: { id: number; remark: string; status: string }) => {
      const res = await apiClient.put<ApiResponse<IContactSubmission>>(`/contact-submissions/${id}/process`, { remark, status })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/contact-submissions/${id}`) },
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}
