import { useState } from 'react'
import { toast } from 'sonner'

import ContactList from './components/ContactList'
import ContactDetailDrawer from './components/ContactDetailDrawer'
import type { IContactSubmission } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'
import {
  useContactList,
  useContactDetail,
  useUnreadCount,
  useReadCount,
  useProcessedCount,
  useProcessContact,
  useDeleteContact,
} from '@/queries/useContactQuery'

export default function ContactsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubmissionId, setActiveSubmissionId] = useState<number | null>(null)
  const { showConfirm } = useConfirmStore()

  // ==================== 1. API 数据拉取 ====================

  const { data, isLoading, refetch } = useContactList({
    page,
    page_size: pageSize,
    status: statusFilter || undefined,
    query: searchQuery.trim() || undefined,
  })

  const { data: detailData } = useContactDetail(activeSubmissionId)
  const { data: countUnread = 0 } = useUnreadCount()
  const { data: countRead = 0 } = useReadCount()
  const { data: countProcessed = 0 } = useProcessedCount()

  const submissions = data?.items || []
  const total = data?.total || 0

  // ==================== 2. API Mutations ====================

  const processMutation = useProcessContact()
  const deleteMutation = useDeleteContact()

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
        onRefetch={() => refetch()}
        onRowClick={(id) => {
          setActiveSubmissionId(id)
        }}
      />

      <ContactDetailDrawer
        submission={detailData as IContactSubmission ?? null}
        isProcessing={processMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onClose={() => setActiveSubmissionId(null)}
        onDelete={(id) => {
          showConfirm({
            title: '确认删除',
            message: '确认要物理擦除此条留言吗？此操作无法撤销。',
            onConfirm: async () => {
              await deleteMutation.mutateAsync(id)
              toast.success('留言记录已成功物理清除')
              setActiveSubmissionId(null)
            }
          })
        }}
        onProcess={async (remark, status) => {
          if (activeSubmissionId) {
            await processMutation.mutateAsync({
              id: activeSubmissionId,
              remark,
              status
            })
            toast.success('留言已成功处理并归档')
          }
        }}
      />
    </>
  )
}
