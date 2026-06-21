import { useState } from 'react'
import { toast } from 'sonner'

import NewsList from './components/NewsList'
import NewsForm from './components/NewsForm'
import type { INewsArticle } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'
import {
  useNewsList,
  useNewsStats,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  useToggleTopNews,
  useChangeNewsStatus,
} from '@/queries/useNewsQuery'

export default function NewsPage() {
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

  const { data, isLoading, isFetching, refetch } = useNewsList({
    page,
    page_size: pageSize,
    title: searchTitle.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  })

  const articles: INewsArticle[] = data?.items || []
  const total = data?.total || 0

  const { data: stats } = useNewsStats()

  // ==================== 2. API Mutations ====================

  const deleteMutation = useDeleteNews()
  const toggleTopMutation = useToggleTopNews()
  const statusMutation = useChangeNewsStatus()
  const createMutation = useCreateNews()
  const updateMutation = useUpdateNews()

  const isSaving = createMutation.isPending || updateMutation.isPending

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
        onRefetch={() => refetch()}
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
              toast.success('文章已成功从数据库抹除')
            }
          })
        }}
        onToggleTop={(id, currentVal) => {
          toggleTopMutation.mutate(
            { id, is_top: !currentVal },
            { onSuccess: () => toast.success('置顶状态更新成功') }
          )
        }}
        onToggleStatus={(id, currentStatus) => {
          statusMutation.mutate(
            { id, status: currentStatus },
            { onSuccess: () => toast.success('文章发布状态已改变') }
          )
        }}
      />
    )
  }

  return (
    <NewsForm
      article={editingArticle}
      isSaving={isSaving}
      onCancel={() => setView('list')}
      onSave={(payload) => {
        if (view === 'edit' && editingArticle) {
          updateMutation.mutate(
            { id: editingArticle.id, payload },
            {
              onSuccess: () => {
                toast.success('文章内容更新成功')
                setView('list')
              },
              onError: (err: any) => toast.error(err.response?.data?.message || '操作保存失败'),
            }
          )
        } else {
          createMutation.mutate(payload, {
            onSuccess: () => {
              toast.success('新闻文章创建成功')
              setView('list')
            },
            onError: (err: any) => toast.error(err.response?.data?.message || '操作保存失败'),
          })
        }
      }}
    />
  )
}
