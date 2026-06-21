import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { INewsArticle, INewsStats } from '@/types/news'

export const newsKeys = {
  all: ['news'] as const,
  list: (params?: Record<string, unknown>) => [...newsKeys.all, 'list', params] as const,
  detail: (id: number) => [...newsKeys.all, 'detail', id] as const,
  stats: ['news-stats'] as const,
}

export function useNewsList(params: {
  page: number; page_size: number; title?: string; status?: string; category?: string
}) {
  return useQuery({
    queryKey: newsKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<INewsArticle>>>('/news', { params })
      return res.data.data
    },
  })
}

export function useNewsStats() {
  return useQuery({
    queryKey: newsKeys.stats,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<INewsStats>>('/news/stats')
      return res.data.data
    },
  })
}

export function useCreateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<INewsArticle>) => {
      const res = await apiClient.post<ApiResponse<INewsArticle>>('/news', payload)
      return res.data.data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: newsKeys.all }); qc.invalidateQueries({ queryKey: newsKeys.stats }) },
  })
}

export function useUpdateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<INewsArticle> }) => {
      const res = await apiClient.put<ApiResponse<INewsArticle>>(`/news/${id}`, payload)
      return res.data.data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: newsKeys.all }); qc.invalidateQueries({ queryKey: newsKeys.stats }) },
  })
}

export function useDeleteNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/news/${id}`) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: newsKeys.all }); qc.invalidateQueries({ queryKey: newsKeys.stats }) },
  })
}

export function useToggleTopNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_top }: { id: number; is_top: boolean }) => {
      await apiClient.put(`/news/${id}`, { is_top })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  })
}

export function useChangeNewsStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiClient.put(`/news/${id}/status`, { status })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: newsKeys.all }); qc.invalidateQueries({ queryKey: newsKeys.stats }) },
  })
}
