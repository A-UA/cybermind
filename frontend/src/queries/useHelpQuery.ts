import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IHelpCategory, IHelpQuestion } from '@/types/help'

export const helpKeys = {
  all: ['help'] as const,
  categories: ['help-categories'] as const,
  questions: (params?: Record<string, unknown>) => ['help-questions', params] as const,
}

export function useCategoryList() {
  return useQuery({
    queryKey: helpKeys.categories,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IHelpCategory[]>>('/help/categories')
      return res.data.data ?? []
    },
  })
}

export function useQuestionList(params?: { category_id?: number; query?: string }) {
  return useQuery({
    queryKey: helpKeys.questions(params),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IHelpQuestion[]>>('/help/questions', { params })
      return res.data.data ?? []
    },
  })
}

export function useSaveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: number; payload: { name: string; sort_order: number } }) => {
      if (id) {
        await apiClient.put(`/help/categories/${id}`, payload)
      } else {
        await apiClient.post('/help/categories', payload)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.all }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/help/categories/${id}`) },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.all }),
  })
}

export function useSaveQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: number; payload: Partial<IHelpQuestion> }) => {
      if (id) {
        await apiClient.put(`/help/questions/${id}`, payload)
      } else {
        await apiClient.post('/help/questions', payload)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.all }),
  })
}

export function useDeleteQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`/help/questions/${id}`) },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.all }),
  })
}

export function useToggleQuestionActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      await apiClient.put(`/help/questions/${id}`, { is_active })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: helpKeys.all }),
  })
}
