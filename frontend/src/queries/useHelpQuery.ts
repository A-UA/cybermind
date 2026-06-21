import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IHelpCategory, IHelpQuestion } from '@/types/help'

export const helpKeys = {
  categories: ['help-categories'] as const,
  questions: (category_id?: number | null, query?: string) =>
    ['help-questions', category_id, query] as const,
}

/** 获取帮助分类列表 */
export function useHelpCategories() {
  return useQuery({
    queryKey: helpKeys.categories,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IHelpCategory[]>>('/help/categories')
      return res.data.data ?? []
    },
  })
}

/** 获取帮助问答列表 */
export function useHelpQuestions(params: { category_id?: number | null; query?: string }) {
  return useQuery({
    queryKey: helpKeys.questions(params.category_id, params.query),
    queryFn: async () => {
      const queryParams: Record<string, unknown> = {}
      if (params.category_id !== null && params.category_id !== undefined) {
        queryParams.category_id = params.category_id
      }
      if (params.query?.trim()) queryParams.query = params.query
      const res = await apiClient.get<ApiResponse<IHelpQuestion[]>>('/help/questions', { params: queryParams })
      return res.data.data ?? []
    },
  })
}

/** 保存分类（创建或更新） */
export function useSaveHelpCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, sort_order }: { id?: number; name: string; sort_order: number }) => {
      if (id) {
        await apiClient.put(`/help/categories/${id}`, { name, sort_order })
      } else {
        await apiClient.post('/help/categories', { name, sort_order })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.categories }),
  })
}

/** 删除分类 */
export function useDeleteHelpCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/help/categories/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.categories }),
  })
}

/** 保存问答（创建或更新） */
export function useSaveHelpQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: number; payload: Partial<IHelpQuestion> }) => {
      if (id) {
        await apiClient.put(`/help/questions/${id}`, payload)
      } else {
        await apiClient.post('/help/questions', payload)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help-questions'] }),
  })
}

/** 删除问答 */
export function useDeleteHelpQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/help/questions/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help-questions'] }),
  })
}

/** 切换问答启用状态 */
export function useToggleHelpQuestionActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      await apiClient.put(`/help/questions/${id}`, { is_active })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help-questions'] }),
  })
}
