import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'

import ContactList from './components/ContactList'
import ContactDetailDrawer from './components/ContactDetailDrawer'
import type { IContactSubmission } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'

export default function ContactsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubmission, setActiveSubmission] = useState<IContactSubmission | null>(null)
  const { showConfirm } = useConfirmStore()

  // ==================== 1. API 数据拉取 ====================
  // 获取分页留言列表
  const { data, isLoading, refetch } = useQuery<{
    items: IContactSubmission[]
    total: number
  }>({
    queryKey: ['contact-submissions', page, pageSize, statusFilter, searchQuery],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize }
      if (statusFilter) params.status = statusFilter
      if (searchQuery.trim()) params.query = searchQuery
      const res = await apiClient.get('/contact-submissions', { params })
      return res.data.data
    }
  })

  // 局部统计 - 查询未读数量
  const { data: countUnread = 0, refetch: refetchUnread } = useQuery<number>({
    queryKey: ['contacts-count-unread'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { status: 'unread', page_size: 1 } })
      return res.data.data.total
    }
  })

  // 局部统计 - 查询已读数量
  const { data: countRead = 0, refetch: refetchRead } = useQuery<number>({
    queryKey: ['contacts-count-read'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { status: 'read', page_size: 1 } })
      return res.data.data.total
    }
  })

  // 局部统计 - 查询已处理数量
  const { data: countProcessed = 0, refetch: refetchProcessed } = useQuery<number>({
    queryKey: ['contacts-count-processed'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { status: 'processed', page_size: 1 } })
      return res.data.data.total
    }
  })

  const submissions = data?.items || []
  const total = data?.total || 0

  const refetchCounts = () => {
    refetchUnread()
    refetchRead()
    refetchProcessed()
  }

  // ==================== 2. API Mutations ====================

  // 详情获取并标记已读
  const detailQueryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.get(`/contact-submissions/${id}`)
      return res.data.data
    },
    onSuccess: (updatedSub: IContactSubmission) => {
      setActiveSubmission(updatedSub)
      refetch()
      refetchCounts()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '加载详情失败')
    }
  })

  // 处理并归档
  const processMutation = useMutation({
    mutationFn: async ({ id, remark, status }: { id: number; remark: string; status: string }) => {
      const res = await apiClient.put(`/contact-submissions/${id}/process`, { remark, status })
      return res.data.data
    },
    onSuccess: (updatedSub: IContactSubmission) => {
      toast.success('留言已成功处理并归档')
      setActiveSubmission(updatedSub)
      refetch()
      refetchCounts()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '留言处理失败')
    }
  })

  // 物理删除
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/contact-submissions/${id}`)
    },
    onSuccess: () => {
      toast.success('留言记录已成功物理清除')
      setActiveSubmission(null)
      refetch()
      refetchCounts()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '留言删除失败')
    }
  })

  // ==================== 3. 页面渲染逻辑 ====================

  return (
    <>
      <ContactList
        submissions={submissions}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
        countUnread={countUnread}
        countRead={countRead}
        countProcessed={countProcessed}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status)
          setPage(1)
        }}
        searchQuery={searchQuery}
        onSearchQueryChange={(query) => {
          setSearchQuery(query)
          setPage(1)
        }}
        onRefetch={() => {
          refetch()
          refetchCounts()
        }}
        onRowClick={(id) => {
          detailQueryMutation.mutate(id)
        }}
      />

      <ContactDetailDrawer
        submission={activeSubmission}
        isProcessing={processMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onClose={() => setActiveSubmission(null)}
        onDelete={(id) => {
          showConfirm({
            title: '确认删除',
            message: '确认要物理擦除此条留言吗？此操作无法撤销。',
            onConfirm: async () => {
              await deleteMutation.mutateAsync(id)
            }
          })
        }}
        onProcess={async (remark, status) => {
          if (activeSubmission) {
            await processMutation.mutateAsync({
              id: activeSubmission.id,
              remark,
              status
            })
          }
        }}
      />
    </>
  )
}
