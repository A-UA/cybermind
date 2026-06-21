import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse, PaginatedData } from '@/types/api'
import type { IContactSubmission } from '@/types/contact'

export const contactKeys = {
  all: ['contact-submissions'] as const,
  list: (params: { page: number; page_size: number; status?: string; query?: string }) =>
    [...contactKeys.all, params.page, params.page_size, params.status, params.query] as const,
  detail: (id: number) => [...contactKeys.all, 'detail', id] as const,
  countUnread: ['contacts-count-unread'] as const,
  countRead: ['contacts-count-read'] as const,
  countProcessed: ['contacts-count-processed'] as const,
}

/** 获取留言列表 */
export function useContactList(params: {
  page: number; page_size: number; status?: string; query?: string
}) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>(
        '/contact-submissions',
        { params },
      )
      return res.data.data
    },
  })
}

/** 获取未读数量 */
export function useUnreadCount() {
  return useQuery({
    queryKey: contactKeys.countUnread,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>(
        '/contact-submissions',
        { params: { status: 'unread', page_size: 1 } },
      )
      return res.data.data?.total ?? 0
    },
  })
}

/** 获取已读数量 */
export function useReadCount() {
  return useQuery({
    queryKey: contactKeys.countRead,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>(
        '/contact-submissions',
        { params: { status: 'read', page_size: 1 } },
      )
      return res.data.data?.total ?? 0
    },
  })
}

/** 获取已处理数量 */
export function useProcessedCount() {
  return useQuery({
    queryKey: contactKeys.countProcessed,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>(
        '/contact-submissions',
        { params: { status: 'processed', page_size: 1 } },
      )
      return res.data.data?.total ?? 0
    },
  })
}

/** 获取留言详情（自动标记已读） */
export function useContactDetail(id: number | null) {
  return useQuery({
    queryKey: contactKeys.detail(id!),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IContactSubmission>>(
        `/contact-submissions/${id}`,
      )
      return res.data.data
    },
    enabled: id !== null,
  })
}

/** 处理并归档留言 */
export function useProcessContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, remark, status }: { id: number; remark: string; status: string }) => {
      const res = await apiClient.put<ApiResponse<IContactSubmission>>(
        `/contact-submissions/${id}/process`,
        { remark, status },
      )
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

/** 删除留言 */
export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/contact-submissions/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}
