import { useState } from 'react'
import { toast } from 'sonner'

import HelpCategoryList from './components/HelpCategoryList'
import HelpQuestionList from './components/HelpQuestionList'
import HelpQuestionForm from './components/HelpQuestionForm'
import type { IHelpCategory, IHelpQuestion } from './types'
import { useConfirmStore } from '@/stores/useConfirmStore'
import {
  useHelpCategories,
  useHelpQuestions,
  useSaveHelpCategory,
  useDeleteHelpCategory,
  useSaveHelpQuestion,
  useDeleteHelpQuestion,
  useToggleHelpQuestionActive,
} from '@/queries/useHelpQuery'

export default function HelpPage() {
  // 问答主视图: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingQuestion, setEditingQuestion] = useState<IHelpQuestion | null>(null)

  // 类别联动及搜索状态
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { showConfirm } = useConfirmStore()

  // ==================== 1. API 数据拉取 ====================

  const { data: categories = [], isLoading: isCategoriesLoading } = useHelpCategories()
  const { data: questions = [], isLoading: isQuestionsLoading, refetch: refetchQuestions } = useHelpQuestions({
    category_id: selectedCategoryId,
    query: searchQuery.trim() || undefined,
  })

  // ==================== 2. API Mutations ====================

  const saveCategoryMutation = useSaveHelpCategory()
  const deleteCategoryMutation = useDeleteHelpCategory()
  const saveQuestionMutation = useSaveHelpQuestion()
  const deleteQuestionMutation = useDeleteHelpQuestion()
  const toggleActiveMutation = useToggleHelpQuestionActive()

  const isSavingQuestion = saveQuestionMutation.isPending

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
            await saveCategoryMutation.mutateAsync({
              id: category?.id,
              name,
              sort_order: sortOrder,
            })
            toast.success(category ? '分类更名成功' : '新增常见问题分类成功')
          }}
          onDeleteCategory={(id) => {
            showConfirm({
              title: '确认删除',
              message: '确认要删除此分类吗？若分类下含有问答关联，操作将被系统阻断。',
              onConfirm: async () => {
                await deleteCategoryMutation.mutateAsync(id)
                toast.success('分类已成功擦除')
                if (selectedCategoryId === id) setSelectedCategoryId(null)
              }
            })
          }}
        />

        <HelpQuestionList
          questions={questions}
          categories={categories}
          isLoading={isQuestionsLoading}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onRefetch={() => refetchQuestions()}
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
            showConfirm({
              title: '确认删除',
              message: '确认要物理删除此问答项吗？此操作不可撤销。',
              onConfirm: async () => {
                await deleteQuestionMutation.mutateAsync(id)
                toast.success('常见问答已成功物理删除')
              }
            })
          }}
          onToggleActive={(id, currentActive) => {
            toggleActiveMutation.mutate(
              { id, is_active: currentActive },
              { onSuccess: () => toast.success('问答前台分发状态已改变') }
            )
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
      isSaving={isSavingQuestion}
      onCancel={() => setView('list')}
      onSave={(payload) => {
        saveQuestionMutation.mutate(
          { id: editingQuestion?.id, payload },
          {
            onSuccess: () => {
              toast.success(view === 'edit' ? '常见问答更新成功' : '新增常见问答成功')
              setView('list')
            },
            onError: (err: any) => toast.error(err.response?.data?.message || '保存问答数据失败'),
          }
        )
      }}
    />
  )
}
