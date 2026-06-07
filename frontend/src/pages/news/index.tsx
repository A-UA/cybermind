import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'

import NewsList from './components/NewsList'
import NewsForm from './components/NewsForm'
import type { INewsArticle, INewsStats } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'

export default function NewsPage() {
  const queryClient = useQueryClient()
  const { showConfirm } = useConfirmStore()

  // 视图状态: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingArticle, setEditingArticle] = useState<INewsArticle | null>(null)

  // 列表筛选与分页状态
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // ==================== 1. API 数据拉取 ====================

  // 获取新闻列表
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['news', page, searchTitle, statusFilter, categoryFilter],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize }
      if (searchTitle.trim()) params.title = searchTitle
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.category = categoryFilter
      const res = await apiClient.get('/news', { params })
      return res.data.data
    }
  })

  const articles: INewsArticle[] = data?.items || []
  const total = data?.total || 0

  // 获取统计数据
  const { data: stats, refetch: refetchStats } = useQuery<INewsStats>({
    queryKey: ['news-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/news/stats')
      return res.data.data
    }
  })

  // ==================== 2. API Mutations ====================

  // 删除文章
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/news/${id}`)
    },
    onSuccess: () => {
      toast.success('文章已成功从数据库抹除')
      queryClient.invalidateQueries({ queryKey: ['news'] })
      refetchStats()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  // 置顶切换
  const toggleTopMutation = useMutation({
    mutationFn: async ({ id, isTopVal }: { id: number; isTopVal: boolean }) => {
      await apiClient.put(`/news/${id}`, { is_top: isTopVal })
    },
    onSuccess: () => {
      toast.success('置顶状态更新成功')
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '更新置顶失败')
    }
  })

  // 改变状态 (发布/下线)
  const statusMutation = useMutation({
    mutationFn: async ({ id, targetStatus }: { id: number; targetStatus: string }) => {
      await apiClient.put(`/news/${id}/status`, { status: targetStatus })
    },
    onSuccess: () => {
      toast.success('文章发布状态已改变')
      queryClient.invalidateQueries({ queryKey: ['news'] })
      refetchStats()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '发布修改失败')
    }
  })

  // 保存或创建文章
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (view === 'edit' && editingArticle) {
        await apiClient.put(`/news/${editingArticle.id}`, payload)
      } else {
        await apiClient.post('/news', payload)
      }
    },
    onSuccess: () => {
      toast.success(view === 'edit' ? '文章内容更新成功' : '新闻文章创建成功')
      setView('list')
      queryClient.invalidateQueries({ queryKey: ['news'] })
      refetchStats()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作保存失败')
    }
  })

  // ==================== 3. 页面渲染逻辑 ====================

  if (view === 'list') {
    return (
      <NewsList
        articles={articles}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        stats={stats}
        searchTitle={searchTitle}
        onSearchTitleChange={(val) => { setSearchTitle(val); setPage(1) }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(val) => { setCategoryFilter(val); setPage(1) }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => { setStatusFilter(val); setPage(1) }}
        onRefetch={() => { refetch(); refetchStats() }}
        onCreate={() => {
          setEditingArticle(null)
          setView('create')
        }}
        onEdit={(article) => {
          setEditingArticle(article)
          setView('edit')
        }}
        onDelete={(id) => {
          showConfirm({
            title: '确认删除',
            message: '确认要物理删除此文章吗？此操作无法撤销。',
            onConfirm: async () => {
              await deleteMutation.mutateAsync(id)
            }
          })
        }}
        onToggleTop={(id, currentVal) => {
          toggleTopMutation.mutate({ id, isTopVal: !currentVal })
        }}
        onToggleStatus={(id, currentStatus) => {
          statusMutation.mutate({ id, targetStatus: currentStatus })
        }}
      />
    )
  }

  return (
    <NewsForm
      article={editingArticle}
      isSaving={saveMutation.isPending}
      onCancel={() => setView('list')}
      onSave={(payload) => saveMutation.mutate(payload)}
    />
  )
}
