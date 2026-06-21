import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IOperationVideo } from '@/types/video'

export const videoKeys = {
  all: ['operation-videos'] as const,
  list: (query?: string, category?: string) => [...videoKeys.all, query, category] as const,
  detail: (id: number) => [...videoKeys.all, 'detail', id] as const,
}

/** 获取视频列表 */
export function useVideoList(params: { query?: string; category?: string }) {
  return useQuery({
    queryKey: videoKeys.list(params.query, params.category),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ items: IOperationVideo[]; total: number }>>('/videos', { params })
      return res.data.data ?? { items: [], total: 0 }
    },
  })
}

/** 保存视频（创建或更新） */
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

/** 删除视频 */
export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/videos/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  })
}

/** 切换视频启用状态 */
export function useToggleVideoActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      await apiClient.put(`/videos/${id}`, { is_active })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  })
}

/** 记录视频播放（自增播放量） */
export function useIncrementVideoView() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.get(`/videos/${id}`, { params: { increment_view: true } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all }),
  })
}
