import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppImageUploader from '@/components/business/AppImageUploader'
import AppVideoUploader from '@/components/business/AppVideoUploader'
import type { IOperationVideo } from '../types'

interface VideoFormProps {
  video: IOperationVideo | null
  onSave: (payload: {
    title: string
    description: string | null
    video_url: string
    cover_image: string | null
    duration: number | null
    category: string | null
    sort_order: number
    is_active: boolean
  }) => void
  onCancel: () => void
  isSaving: boolean
}

export default function VideoForm({
  video,
  onSave,
  onCancel,
  isSaving
}: VideoFormProps) {
  // 表单本地状态
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [category, setCategory] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  // 错误提示
  const [titleError, setTitleError] = useState('')
  const [videoError, setVideoError] = useState('')

  // 初始化状态
  useEffect(() => {
    if (video) {
      setTitle(video.title || '')
      setDescription(video.description || '')
      setVideoUrl(video.video_url || '')
      setCoverImage(video.cover_image || '')
      setDuration(video.duration ?? '')
      setCategory(video.category || '')
      setSortOrder(video.sort_order || 0)
      setIsActive(video.is_active ?? true)
    } else {
      setTitle('')
      setDescription('')
      setVideoUrl('')
      setCoverImage('')
      setDuration('')
      setCategory('')
      setSortOrder(0)
      setIsActive(true)
    }
    setTitleError('')
    setVideoError('')
  }, [video])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!title.trim()) {
      setTitleError('视频标题不能为空')
      hasError = true
    } else {
      setTitleError('')
    }

    if (!videoUrl.trim()) {
      setVideoError('请上传视频文件或填写视频播放链接')
      hasError = true
    } else {
      setVideoError('')
    }

    if (hasError) return

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      video_url: videoUrl,
      cover_image: coverImage || null,
      duration: duration === '' ? null : Number(duration),
      category: category.trim() || null,
      sort_order: sortOrder,
      is_active: isActive
    })
  }

  return (
    <div className="space-y-6 text-foreground font-sans text-xs">
      {/* 顶部控制头卡纸 */}
      <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center justify-center"
            title="返回视频画廊"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
              {video ? '编辑操作视频 / EDIT VIDEO' : '录入操作视频 / UPLOAD VIDEO'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">请上传视频文件、封面图并填写视频属性元数据</p>
          </div>
        </div>

        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3.5deg] hidden sm:inline-block">
          VIDEO MODIFIER
        </div>
      </div>

      {/* 实体硬板表单卡片 */}
      <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 视频文件直传 */}
            <AppFormItem label="上传操作视频文件 / UPLOAD VIDEO FILE" required error={videoError}>
              <AppVideoUploader 
                value={videoUrl} 
                onChange={(url) => {
                  setVideoUrl(url)
                  if (url.trim()) setVideoError('')
                }} 
                onDurationChange={setDuration} 
              />
            </AppFormItem>

            {/* 视频标题 */}
            <AppFormItem label="视频标题 / VIDEO TITLE" required error={titleError}>
              <input
                type="text"
                placeholder="请输入视频标题，以便前台用户精准搜索..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) setTitleError('')
                }}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-bold"
              />
            </AppFormItem>

            {/* 描述信息 */}
            <AppFormItem label="视频描述 / DESCRIPTION (可选)" description="简要介绍该操作视频的主要教学指导内容...">
              <textarea
                placeholder="在此输入详细的视频说明或操作步骤..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold resize-y"
              />
            </AppFormItem>
          </div>

          {/* 右侧窄块 */}
          <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
            <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
              分发与分类配置 / METADATA
            </h3>

            {/* 分类 */}
            <AppFormItem label="视频分类 / CATEGORY" description="例如: 基础入门, 高级进阶, 后台配置">
              <input
                type="text"
                placeholder="请输入视频类别名称"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
              />
            </AppFormItem>

            {/* 封面图 */}
            <AppFormItem label="视频封面图 / COVER IMAGE">
              <AppImageUploader value={coverImage} onChange={setCoverImage} />
            </AppFormItem>

            {/* 时长秒数 (自动提取后亦可手动微调) */}
            <AppFormItem label="视频时长 (秒) / DURATION (SEC)" description="上传视频时系统会自动提取，亦可手动填修">
              <input
                type="number"
                placeholder="自动计算时长"
                value={duration}
                onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </AppFormItem>

            {/* 排序序号 */}
            <AppFormItem label="排序序号 / SORT ORDER">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </AppFormItem>

            {/* 发布状态 */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 bg-background border-2 border-border text-primary focus:ring-0 rounded-md cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">
                  启用并发布此操作视频 (ACTIVE)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 提交/取消 按钮 */}
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
