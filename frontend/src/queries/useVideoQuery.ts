import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IOperationVideo } from '@/types/video'

export const videoKeys = {
  all: ['operation-videos'] as const,
  list: (params?: Record<string, unknown>) => [...videoKeys.all, 'list', params] as const,
}

export function useVideoList(params?: { query?: string; category?: string }) {
  return useQuery({
    queryKey: videoKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ items: IOperationVideo[]; total: number }>>('/videos', { params })
      return res.data.data ?? { items: [], total: 0 }
    },
  })
}

export function useSaveVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: number; payload: Partial<IOperationVideo> }) => {
      if (id) {
        await apiClient.put(`/videos/${id}`, payload)
      } else {
        await apiClient.post('/videos', payload)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  })
}

export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/videos/${id}`) },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  })
}

export function useToggleVideoActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      await apiClient.put(`/videos/${id}`, { is_active })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  })
}
