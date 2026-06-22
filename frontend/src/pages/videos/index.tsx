import { useState } from 'react'
import { toast } from 'sonner'

import VideoList from './components/VideoList'
import VideoForm from './components/VideoForm'
import VideoPlayerModal from './components/VideoPlayerModal'
import type { IOperationVideo } from '@/types/video'
import { useConfirmStore } from '@/stores/useConfirmStore'
import {
  useVideoList,
  useSaveVideo,
  useDeleteVideo,
  useToggleVideoActive,
  useIncrementVideoView,
} from '@/queries/useVideoQuery'

export default function VideosPage() {
  // 页面视图：'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingVideo, setEditingVideo] = useState<IOperationVideo | null>(null)

  // 搜索和过滤
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // 播放器弹窗状态
  const [activePlayVideo, setActivePlayVideo] = useState<IOperationVideo | null>(null)
  const { showConfirm } = useConfirmStore()

  // ==================== 1. API 数据拉取 ====================

  const { data = { items: [] as IOperationVideo[], total: 0 }, isLoading, refetch } = useVideoList({
    query: searchQuery.trim() || undefined,
    category: selectedCategory || undefined,
  })

  const videos = data.items || []

  // ==================== 2. API Mutations ====================

  const saveVideoMutation = useSaveVideo()
  const deleteVideoMutation = useDeleteVideo()
  const toggleActiveMutation = useToggleVideoActive()
  const incrementViewMutation = useIncrementVideoView()

  const isSaving = saveVideoMutation.isPending

  // ==================== 3. 页面渲染逻辑 ====================

  if (view === 'list') {
    return (
      <>
        <VideoList
          videos={videos}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectedCategoryChange={setSelectedCategory}
          onRefetch={() => refetch()}
          onCreate={() => {
            setEditingVideo(null)
            setView('create')
          }}
          onEdit={(v) => {
            setEditingVideo(v)
            setView('edit')
          }}
          onDelete={(id) => {
            showConfirm({
              title: '确认删除',
              message: '确认要物理删除此操作视频吗？此操作无法撤销。',
              onConfirm: async () => {
                await deleteVideoMutation.mutateAsync(id)
                toast.success('操作视频已成功移除')
              }
            })
          }}
          onPlay={(v) => {
            setActivePlayVideo(v)
            incrementViewMutation.mutate(v.id)
          }}
          onToggleActive={(id, currentActive) => {
            toggleActiveMutation.mutate(
              { id, is_active: !currentActive },
              { onSuccess: () => toast.success('视频前台分发状态已刷新') }
            )
          }}
        />

        <VideoPlayerModal
          video={activePlayVideo}
          onClose={() => setActivePlayVideo(null)}
        />
      </>
    )
  }

  return (
    <VideoForm
      video={editingVideo}
      isSaving={isSaving}
      onCancel={() => setView('list')}
      onSave={(payload) => {
        saveVideoMutation.mutate(
          { id: editingVideo?.id, payload: payload as Partial<IOperationVideo> },
          {
            onSuccess: () => {
              toast.success(view === 'edit' ? '操作视频已成功修改' : '成功创建新操作视频')
              setView('list')
            },
            onError: (err: any) => toast.error(err.response?.data?.message || '操作失败'),
          }
        )
      }}
    />
  )
}
