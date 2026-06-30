import React, { useState, useEffect } from 'react'
import AppSelect from '@/components/common/AppSelect'
import AppInput from '@/components/common/AppInput'
import AppButton from '@/components/common/AppButton'
import { Save } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppRichEditor from '@/components/common/AppRichEditor'
import AppCheckbox from '@/components/common/AppCheckbox'
import { AppFormHeader, AppFormCard, AppFormMetaPanel } from '@/components/common/AppFormShell'
import { isRichTextEmpty } from '@/lib/richText'
import type { IHelpQuestion, IHelpCategory } from '../types'

interface HelpQuestionFormProps {
  question: IHelpQuestion | null
  categories: IHelpCategory[]
  defaultCategoryId: number | ''
  onSave: (payload: {
    category_id: number
    question: string
    answer: string
    sort_order: number
    is_active: boolean
  }) => void
  onCancel: () => void
  isSaving: boolean
}

export default function HelpQuestionForm({
  question,
  categories,
  defaultCategoryId,
  onSave,
  onCancel,
  isSaving,
}: HelpQuestionFormProps) {
  // 本地表单状态
  const [questionText, setQuestionText] = useState('')
  const [answerContent, setAnswerContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  // 报错状态
  const [questionError, setQuestionError] = useState('')
  const [answerError, setAnswerError] = useState('')

  // 初始化或切换编辑对象
  useEffect(() => {
    if (question) {
      setQuestionText(question.question || '')
      setAnswerContent(question.answer || '')
      setCategoryId(question.category_id || '')
      setSortOrder(question.sort_order || 0)
      setIsActive(question.is_active ?? true)
    } else {
      setQuestionText('')
      setAnswerContent('')
      setCategoryId(defaultCategoryId)
      setSortOrder(0)
      setIsActive(true)
    }
    setQuestionError('')
    setAnswerError('')
  }, [question, defaultCategoryId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!questionText.trim()) {
      setQuestionError('问题内容不能为空')
      hasError = true
    } else {
      setQuestionError('')
    }

    if (isRichTextEmpty(answerContent)) {
      setAnswerError('答案回复内容不能为空')
      hasError = true
    } else {
      setAnswerError('')
    }

    if (!categoryId) {
      hasError = true
    }

    if (hasError) return

    onSave({
      category_id: Number(categoryId),
      question: questionText.trim(),
      answer: answerContent,
      sort_order: sortOrder,
      is_active: isActive,
    })
  }

  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部控制栏 */}
      <AppFormHeader
        title={question ? '编辑常见问答' : '创建常见问答'}
        description="请录入常见问题与富文本格式的回答内容"
        backTitle="返回问答列表"
        onBack={onCancel}
      />

      {/* 表单卡片 */}
      <AppFormCard onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块：问题与富文本答案 */}
          <div className="lg:col-span-2 space-y-5">
            {/* 问题内容 */}
            <AppFormItem
              label="常见问题内容"
              required
              error={questionError}
            >
              <AppInput
                type="text"
                placeholder="请输入常见问题内容，例如：如何找回登录密码？"
                value={questionText}
                onChange={e => {
                  setQuestionText(e.target.value)
                  if (e.target.value.trim()) setQuestionError('')
                }}
              />
            </AppFormItem>

            {/* 富文本答案 */}
            <AppFormItem
              label="问题解答详情"
              required
              error={answerError}
            >
              <AppRichEditor
                value={answerContent}
                onChange={val => {
                  setAnswerContent(val)
                  if (!isRichTextEmpty(val)) setAnswerError('')
                }}
                preset="basic"
                placeholder="在此撰写常见问题的详细解答..."
              />
            </AppFormItem>
          </div>

          {/* 右侧窄块 */}
          <div className="space-y-5">
            <AppFormMetaPanel title="分类与排序配置">
              {/* 所属分类 */}
              <AppFormItem label="所属常见问题分类" required>
                <AppSelect
                  width="full"
                  value={String(categoryId)}
                  onValueChange={(val) => setCategoryId(val ? Number(val) : '')}
                  placeholder="选择所属分类"
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                />
              </AppFormItem>

              {/* 排序序号 */}
              <AppFormItem label="排序序号">
                <AppInput
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                  className="font-mono font-medium"
                />
              </AppFormItem>

              {/* 分发状态 */}
              <div className="pt-3 border-t border-border">
                <AppCheckbox
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  label="启用此常见问题解答"
                />
              </div>
            </AppFormMetaPanel>
          </div>
        </div>

        {/* 提交/取消 按钮 */}
        <div className="flex justify-end gap-2.5 border-t border-border pt-5 mt-6">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            取消
          </AppButton>
          <AppButton
            type="submit"
            loading={isSaving}
            icon={<Save className="h-4 w-4" strokeWidth={1.75} />}
          >
            确认保存
          </AppButton>
        </div>
      </AppFormCard>
    </div>
  )
}
