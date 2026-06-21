import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { IOverview, ITrendItem, ITopPage } from '@/types/dashboard'
import type { INewsArticle } from '@/types/news'
import type { IContactSubmission } from '@/types/contact'
import type { PaginatedData } from '@/types/api'

// ======================== Query Keys ========================

export const statsKeys = {
  all: ['stats'] as const,
  overview: () => [...statsKeys.all, 'overview'] as const,
  trend: (days: number) => [...statsKeys.all, 'trend', days] as const,
  topPages: (limit: number) => [...statsKeys.all, 'top-pages', limit] as const,
}

export const dashboardKeys = {
  recentNews: ['dashboard-recent-news'] as const,
  recentContacts: ['dashboard-recent-contacts'] as const,
}

// ======================== Queries ========================

/** 获取总览指标 */
export function useOverview() {
  return useQuery({
    queryKey: statsKeys.overview(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IOverview>>('/stats/overview')
      return res.data.data
    },
  })
}

/** 获取趋势折线图数据 */
export function useTrend(days = 7) {
  return useQuery({
    queryKey: statsKeys.trend(days),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ITrendItem[]>>(`/stats/trend?days=${days}`)
      return res.data.data ?? []
    },
  })
}

/** 获取热门页面排行 */
export function useTopPages(limit = 5) {
  return useQuery({
    queryKey: statsKeys.topPages(limit),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ITopPage[]>>(`/stats/top-pages?limit=${limit}`)
      return res.data.data ?? []
    },
  })
}

/** 获取最新文章（Dashboard 专用） */
export function useRecentNews() {
  return useQuery({
    queryKey: dashboardKeys.recentNews,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<INewsArticle>>>('/news', {
        params: { page: 1, page_size: 5 },
      })
      return res.data.data?.items ?? []
    },
  })
}

/** 获取最新留言（Dashboard 专用） */
export function useRecentContacts() {
  return useQuery({
    queryKey: dashboardKeys.recentContacts,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedData<IContactSubmission>>>(
        '/contact-submissions',
        { params: { page: 1, page_size: 5 } },
      )
      return res.data.data?.items ?? []
    },
  })
}
