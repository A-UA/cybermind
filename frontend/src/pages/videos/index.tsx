import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'

import VideoList from './components/VideoList'
import VideoForm from './components/VideoForm'
import VideoPlayerModal from './components/VideoPlayerModal'
import type { IOperationVideo } from './types'

export default function VideosPage() {
  // 页面视图：'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingVideo, setEditingVideo] = useState<IOperationVideo | null>(null)

  // 搜索和过滤
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // 播放器弹窗状态
  const [activePlayVideo, setActivePlayVideo] = useState<IOperationVideo | null>(null)

  // ==================== 1. API 数据拉取 ====================

  // 获取视频列表
  const { data = { items: [] as IOperationVideo[], total: 0 }, isLoading, refetch } = useQuery<{
    items: IOperationVideo[]
    total: number
  }>({
    queryKey: ['operation-videos', searchQuery, selectedCategory],
    queryFn: async () => {
      const params: any = {}
      if (searchQuery.trim()) params.query = searchQuery
      if (selectedCategory) params.category = selectedCategory
      const res = await apiClient.get('/videos', { params })
      return res.data.data
    }
  })

  const videos = data.items || []

  // ==================== 2. API Mutations ====================

  // 保存视频
  const saveVideoMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (view === 'edit' && editingVideo) {
        await apiClient.put(`/videos/${editingVideo.id}`, payload)
      } else {
        await apiClient.post('/videos', payload)
      }
    },
    onSuccess: () => {
      toast.success(view === 'edit' ? '操作视频已成功修改' : '成功创建新操作视频')
      setView('list')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  // 删除视频
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/videos/${id}`)
    },
    onSuccess: () => {
      toast.success('操作视频已成功移除')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '删除视频失败')
    }
  })

  // 快捷切换启用/禁用
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activeVal }: { id: number; activeVal: boolean }) => {
      await apiClient.put(`/videos/${id}`, { is_active: activeVal })
    },
    onSuccess: () => {
      toast.success('视频前台分发状态已刷新')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  // 触发视频播放并自增播放量
  const handlePlayVideo = async (v: IOperationVideo) => {
    setActivePlayVideo(v)
    try {
      // 请求后端详情页，并携带自增参数，异步记录观看
      await apiClient.get(`/videos/${v.id}`, { params: { increment_view: true } })
      refetch() // 刷新列表以显示最新播放数
    } catch {
      // 静默失败
    }
  }

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
          onRefetch={refetch}
          onCreate={() => {
            setEditingVideo(null)
            setView('create')
          }}
          onEdit={(v) => {
            setEditingVideo(v)
            setView('edit')
          }}
          onDelete={(id) => {
            if (window.confirm('确认要物理删除此操作视频吗？此操作无法撤销。')) {
              deleteVideoMutation.mutate(id)
            }
          }}
          onPlay={handlePlayVideo}
          onToggleActive={(id, currentActive) => {
            toggleActiveMutation.mutate({ id, activeVal: currentActive })
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
      isSaving={saveVideoMutation.isPending}
      onCancel={() => setView('list')}
      onSave={(payload) => saveVideoMutation.mutate(payload)}
    />
  )
}
