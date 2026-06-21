import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { IBanner } from '@/types/banner'

export const bannerKeys = {
  all: ['banners'] as const,
  list: (params: { page: number; page_size: number; is_active?: boolean }) =>
    [...bannerKeys.all, params.page, params.page_size, params.is_active] as const,
  detail: (id: number) => [...bannerKeys.all, 'detail', id] as const,
}

export function useBannerList(params: { page: number; page_size: number; is_active?: boolean }) {
  return useQuery({
    queryKey: bannerKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IBanner>>>('/banners', { params })
      return res.data.data
    },
  })
}

export function useCreateBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<IBanner>) => {
      const res = await apiClient.post<ApiResponse<IBanner>>('/banners', payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: bannerKeys.all }),
  })
}

export function useUpdateBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<IBanner> }) => {
      const res = await apiClient.put<ApiResponse<IBanner>>(`/banners/${id}`, payload)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: bannerKeys.all }),
  })
}

export function useDeleteBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/banners/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: bannerKeys.all }),
  })
}
