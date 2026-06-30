import React, { useState, useEffect } from 'react'
import AppSelect from '@/components/common/AppSelect'
import AppInput from '@/components/common/AppInput'
import AppTextarea from '@/components/common/AppTextarea'
import AppButton from '@/components/common/AppButton'
import { Save } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppImageUploader from '@/components/business/AppImageUploader'
import AppRichEditor from '@/components/common/AppRichEditor'
import AppCheckbox from '@/components/common/AppCheckbox'
import { AppFormHeader, AppFormCard, AppFormMetaPanel } from '@/components/common/AppFormShell'
import { isRichTextEmpty } from '@/lib/richText'
import { getApiErrorMessage } from '@/lib/api'
import { uploadRichTextImage } from '@/lib/richTextUpload'
import { toast } from 'sonner'
import type { INewsArticle } from '../types'

interface NewsFormProps {
  article: INewsArticle | null
  onSave: (payload: {
    title: string
    summary: string | null
    content: string
    cover_image: string | null
    category: string
    tags: string | null
    is_top: boolean
  }) => void
  onCancel: () => void
  isSaving: boolean
}

export default function NewsForm({
  article,
  onSave,
  onCancel,
  isSaving
}: NewsFormProps) {
  // 表单字段本地状态
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('industry')
  const [tagsInput, setTagsInput] = useState('')
  const [isTop, setIsTop] = useState(false)
  const [content, setContent] = useState('')

  // 错误消息状态
  const [titleError, setTitleError] = useState('')
  const [contentError, setContentError] = useState('')

  // 初始化或切换编辑对象
  useEffect(() => {
    if (article) {
      setTitle(article.title || '')
      setSummary(article.summary || '')
      setCoverImage(article.cover_image || '')
      setCategory(article.category || 'industry')
      setContent(article.content || '')
      setIsTop(article.is_top || false)

      if (article.tags) {
        try {
          const tagsArr = JSON.parse(article.tags)
          setTagsInput(Array.isArray(tagsArr) ? tagsArr.join(', ') : '')
        } catch {
          setTagsInput(article.tags)
        }
      } else {
        setTagsInput('')
      }
    } else {
      // 新建状态清空
      setTitle('')
      setSummary('')
      setCoverImage('')
      setCategory('industry')
      setTagsInput('')
      setIsTop(false)
      setContent('')
    }
    setTitleError('')
    setContentError('')
  }, [article])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!title.trim()) {
      setTitleError('文章标题不能为空')
      hasError = true
    } else {
      setTitleError('')
    }

    if (isRichTextEmpty(content)) {
      setContentError('文章正文内容不能为空')
      hasError = true
    } else {
      setContentError('')
    }

    if (hasError) return

    // 格式化 tags
    const tagsList = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const tagsStr = tagsList.length > 0 ? JSON.stringify(tagsList) : null

    onSave({
      title,
      summary: summary.trim() || null,
      content,
      cover_image: coverImage || null,
      category,
      tags: tagsStr,
      is_top: isTop
    })
  }

  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部标题横幅 */}
      <AppFormHeader
        title={article ? '编辑文章内容' : '撰写新文章'}
        description="请录入文章基础信息与富文本编辑内容"
        backTitle="返回文章列表"
        onBack={onCancel}
      />

      {/* 实体卡片表单 */}
      <AppFormCard onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块：标题和富文本正文 */}
          <div className="lg:col-span-2 space-y-5">
            {/* 文章标题 */}
            <AppFormItem label="文章标题" required error={titleError}>
              <AppInput
                type="text"
                placeholder="请输入文章核心标题..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) setTitleError('')
                }}
              />
            </AppFormItem>

            {/* 摘要说明 */}
            <AppFormItem label="文章摘要 (可选)" description="简明扼要地概括文章主旨...">
              <AppTextarea
                placeholder="在此录入摘要描述..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
              />
            </AppFormItem>

            {/* 富文本编辑器 */}
            <AppFormItem label="文章富文本正文" required error={contentError}>
              <AppRichEditor
                value={content}
                onChange={(val) => {
                  setContent(val)
                  if (!isRichTextEmpty(val)) setContentError('')
                }}
                preset="article"
                uploadImage={uploadRichTextImage}
                onUploadError={(err) => toast.error(getApiErrorMessage(err, '图片上传失败'))}
                placeholder="在此撰写文章内容..."
              />
            </AppFormItem>
          </div>

          {/* 右侧元数据 */}
          <div className="space-y-5">
            <AppFormMetaPanel title="属性与分发元数据">
              {/* 文章分类 */}
              <AppFormItem label="文章分类">
                <AppSelect
                  width="full"
                  value={category}
                  onValueChange={(val) => setCategory(val || 'industry')}
                  placeholder="选择分类"
                  options={[
                    { value: 'industry', label: '行业动态' },
                    { value: 'company', label: '企业新闻' },
                    { value: 'product', label: '产品公告' },
                  ]}
                />
              </AppFormItem>

              {/* 封面图 */}
              <AppFormItem label="文章封面图">
                <AppImageUploader value={coverImage} onChange={setCoverImage} />
              </AppFormItem>

              {/* 标签 */}
              <AppFormItem
                label="文章标签"
                description="标签用英文逗号分隔, 如: 科技, AI, 官网"
              >
                <AppInput
                  type="text"
                  placeholder="科技, AI, 官网"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </AppFormItem>

              {/* 置顶属性 */}
              <div className="pt-3 border-t border-border">
                <AppCheckbox
                  checked={isTop}
                  onCheckedChange={setIsTop}
                  label="设置此文章置顶"
                />
              </div>
            </AppFormMetaPanel>
          </div>
        </div>

        {/* 提交/取消 按钮栏 */}
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
