import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'

import HelpCategoryList from './components/HelpCategoryList'
import HelpQuestionList from './components/HelpQuestionList'
import HelpQuestionForm from './components/HelpQuestionForm'
import type { IHelpCategory, IHelpQuestion } from './types'

export default function HelpPage() {
  // 问答主视图: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingQuestion, setEditingQuestion] = useState<IHelpQuestion | null>(null)

  // 类别联动及搜索状态
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // ==================== 1. API 数据拉取 ====================

  // 获取分类列表
  const { data: categories = [], isLoading: isCategoriesLoading, refetch: refetchCategories } = useQuery<IHelpCategory[]>({
    queryKey: ['help-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/help/categories')
      return res.data.data
    }
  })

  // 获取问题列表
  const { data: questions = [], isLoading: isQuestionsLoading, refetch: refetchQuestions } = useQuery<IHelpQuestion[]>({
    queryKey: ['help-questions', selectedCategoryId, searchQuery],
    queryFn: async () => {
      const params: any = {}
      if (selectedCategoryId !== null) params.category_id = selectedCategoryId
      if (searchQuery.trim()) params.query = searchQuery
      const res = await apiClient.get('/help/questions', { params })
      return res.data.data
    }
  })

  // ==================== 2. API Mutations ====================

  // 保存分类
  const saveCategoryMutation = useMutation({
    mutationFn: async ({ name, sortOrder, category }: { name: string; sortOrder: number; category: IHelpCategory | null }) => {
      const payload = { name, sort_order: sortOrder }
      if (category) {
        await apiClient.put(`/help/categories/${category.id}`, payload)
      } else {
        await apiClient.post('/help/categories', payload)
      }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.category ? '分类更名成功' : '新增常见问题分类成功')
      refetchCategories()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作分类失败')
    }
  })

  // 删除分类
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/help/categories/${id}`)
    },
    onSuccess: (_, id) => {
      toast.success('分类已成功擦除')
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null)
      }
      refetchCategories()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '删除分类失败')
    }
  })

  // 保存问答
  const saveQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (view === 'edit' && editingQuestion) {
        await apiClient.put(`/help/questions/${editingQuestion.id}`, payload)
      } else {
        await apiClient.post('/help/questions', payload)
      }
    },
    onSuccess: () => {
      toast.success(view === 'edit' ? '常见问答更新成功' : '新增常见问答成功')
      setView('list')
      refetchQuestions()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存问答数据失败')
    }
  })

  // 删除问答
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/help/questions/${id}`)
    },
    onSuccess: () => {
      toast.success('常见问答已成功物理删除')
      refetchQuestions()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  // 状态改变
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activeVal }: { id: number; activeVal: boolean }) => {
      await apiClient.put(`/help/questions/${id}`, { is_active: activeVal })
    },
    onSuccess: () => {
      toast.success('问答前台分发状态已改变')
      refetchQuestions()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '更新状态失败')
    }
  })

  // ==================== 3. 页面渲染逻辑 ====================

  if (view === 'list') {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-foreground font-sans">
        <HelpCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          isLoading={isCategoriesLoading}
          onSaveCategory={async (name, sortOrder, category) => {
            await saveCategoryMutation.mutateAsync({ name, sortOrder, category })
          }}
          onDeleteCategory={(id) => {
            if (window.confirm('确认要删除此分类吗？若分类下含有问答关联，操作将被系统阻断。')) {
              deleteCategoryMutation.mutate(id)
            }
          }}
        />

        <HelpQuestionList
          questions={questions}
          categories={categories}
          isLoading={isQuestionsLoading}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onRefetch={() => {
            refetchCategories()
            refetchQuestions()
          }}
          onCreateQuestion={() => {
            if (categories.length === 0) {
              toast.error('请先在左侧建立常见问题分类！')
              return
            }
            setEditingQuestion(null)
            setView('create')
          }}
          onEditQuestion={(q) => {
            setEditingQuestion(q)
            setView('edit')
          }}
          onDeleteQuestion={(id) => {
            if (window.confirm('确认要物理删除此问答项吗？此操作不可撤销。')) {
              deleteQuestionMutation.mutate(id)
            }
          }}
          onToggleActive={(id, currentActive) => {
            toggleActiveMutation.mutate({ id, activeVal: currentActive })
          }}
        />
      </div>
    )
  }

  return (
    <HelpQuestionForm
      question={editingQuestion}
      categories={categories}
      defaultCategoryId={selectedCategoryId || (categories.length > 0 ? categories[0].id : '')}
      isSaving={saveQuestionMutation.isPending}
      onCancel={() => setView('list')}
      onSave={(payload) => saveQuestionMutation.mutate(payload)}
    />
  )
}
