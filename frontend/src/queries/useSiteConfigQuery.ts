import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IUser } from '@/types/user'

export const siteConfigKeys = {
  all: ['site-config'] as const,
}

export function useSiteConfig() {
  return useQuery({
    queryKey: siteConfigKeys.all,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IUser[]>>('/site-config')
      return res.data.data ?? []
    },
  })
}

export function useSaveSiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (configs: Record<string, string>) => {
      await apiClient.put('/site-config', { configs })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: siteConfigKeys.all }),
  })
}
