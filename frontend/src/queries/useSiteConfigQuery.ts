import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'

export interface ISiteConfigItem {
  id: number
  config_key: string
  config_value: string
  config_type: string
  description: string
  updated_at: string
}

export const siteConfigKeys = {
  all: ['site-config'] as const,
}

/** 获取站点配置 */
export function useSiteConfig() {
  return useQuery({
    queryKey: siteConfigKeys.all,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ISiteConfigItem[]>>('/site-config')
      return res.data.data ?? []
    },
  })
}

/** 批量保存站点配置 */
export function useSaveSiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (configs: Record<string, string>) => {
      await apiClient.put('/site-config', { configs })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: siteConfigKeys.all }),
  })
}
