import React, { useState, useEffect } from 'react'
import AppSelect from '@/components/common/AppSelect'
import AppInput from '@/components/common/AppInput'
import AppTextarea from '@/components/common/AppTextarea'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppImageUploader from '@/components/business/AppImageUploader'
import AppRichEditor from '@/components/common/AppRichEditor'
import AppCheckbox from '@/components/common/AppCheckbox'
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
  const [category, setCategory] = useState('行业动态')
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
      setCategory(article.category || '行业动态')
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
      setCategory('行业动态')
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

    if (!content.trim()) {
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
      <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center justify-center"
            title="返回文章列表"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
              {article ? '编辑文章内容 / EDIT POST' : '撰写新文章 / WRITE POST'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">请录入文章基础信息与富文本编辑内容</p>
          </div>
        </div>

        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3deg] hidden sm:inline-block">
          EDITOR MODE
        </div>
      </div>

      {/* 实体卡片表单 */}
      <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块：标题和富文本正文 (两列宽) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文章标题 */}
            <AppFormItem label="文章标题 / ARTICLE TITLE" required error={titleError}>
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
            <AppFormItem label="文章摘要 / SUMMARY (可选)" description="简明扼要地概括文章主旨...">
              <AppTextarea
                placeholder="在此录入摘要描述..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
              />
            </AppFormItem>

            {/* 富文本编辑器 */}
            <AppFormItem label="文章富文本正文 / EDITORIAL CONTENT" required error={contentError}>
              <AppRichEditor 
                value={content} 
                onChange={(val) => {
                  setContent(val)
                  if (val.trim()) setContentError('')
                }} 
              />
            </AppFormItem>
          </div>

          {/* 右侧元数据 */}
          <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
            <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
              属性与分发元数据 / METADATA
            </h3>

            {/* 文章分类 */}
            <AppFormItem label="文章分类 / CATEGORY">
              <AppSelect
                width="full"
                value={category}
                onValueChange={(val) => setCategory(val || '行业动态')}
                placeholder="选择分类"
                options={[
                  { value: '行业动态', label: '行业动态' },
                  { value: '企业新闻', label: '企业新闻' },
                  { value: '产品公告', label: '产品公告' },
                ]}
              />
            </AppFormItem>

            {/* 封面图 */}
            <AppFormItem label="文章封面图 / COVER IMAGE">
              <AppImageUploader value={coverImage} onChange={setCoverImage} />
            </AppFormItem>

            {/* 标签 */}
            <AppFormItem 
              label="文章标签 / TAGS" 
              description="标签用英文逗号分隔, 如: 科技, AI, 官网"
            >
              <input
                type="text"
                placeholder="科技, AI, 官网"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
              />
            </AppFormItem>

            {/* 置顶属性 */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <AppCheckbox
                checked={isTop}
                onCheckedChange={setIsTop}
                label="设置此文章置顶 (STICK TO TOP)"
              />
            </div>
          </div>
        </div>

        {/* 提交/取消 按钮栏 */}
        <div className="flex justify-end space-x-3 border-t-2 border-border pt-6 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
          >
            取消 CANCEL
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-2.5 bg-primary text-primary-foreground border-2 border-border font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>确认保存 SUBMIT</span>
          </button>
        </div>
      </form>
    </div>
  )
}
