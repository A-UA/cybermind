import React, { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppInput from '@/components/common/AppInput'
import AppTextarea from '@/components/common/AppTextarea'
import AppImageUploader from '@/components/business/AppImageUploader'
import AppVideoUploader from '@/components/business/AppVideoUploader'
import AppCheckbox from '@/components/common/AppCheckbox'
import AppButton from '@/components/common/AppButton'
import { AppFormHeader, AppFormCard, AppFormMetaPanel } from '@/components/common/AppFormShell'
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
      <AppFormHeader
        title={video ? '编辑操作视频' : '上传操作视频'}
        description="请上传视频文件、封面图并填写视频属性元数据"
        backTitle="返回视频列表"
        onBack={onCancel}
      />

      {/* 表单卡片 */}
      <AppFormCard onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Block */}
          <div className="lg:col-span-2 space-y-5">
            {/* 视频文件直传 */}
            <AppFormItem label="上传操作视频文件" required error={videoError}>
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
            <AppFormItem label="视频标题" required error={titleError}>
              <AppInput
                type="text"
                placeholder="请输入视频标题，以便前台用户精准搜索..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) setTitleError('')
                }}
              />
            </AppFormItem>

            {/* 描述信息 */}
            <AppFormItem label="视频描述 (可选)" description="简要介绍该操作视频的主要教学指导内容...">
              <AppTextarea
                placeholder="在此输入详细的视频说明或操作步骤..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                resize="vertical"
              />
            </AppFormItem>
          </div>

          {/* Right Block */}
          <div className="space-y-5">
            <AppFormMetaPanel title="分发与分类配置">
              {/* 分类 */}
              <AppFormItem label="视频分类" description="例如: 基础入门, 高级进阶, 后台配置">
                <AppInput
                  type="text"
                  placeholder="请输入视频类别名称"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </AppFormItem>

              {/* 封面图 */}
              <AppFormItem label="视频封面图">
                <AppImageUploader value={coverImage} onChange={setCoverImage} />
              </AppFormItem>

              {/* 时长秒数 */}
              <AppFormItem label="视频时长 (秒)" description="上传视频时系统会自动提取，亦可手动填修">
                <AppInput
                  type="number"
                  placeholder="自动计算时长"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                  className="font-mono font-medium"
                />
              </AppFormItem>

              {/* 排序序号 */}
              <AppFormItem label="排序序号">
                <AppInput
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="font-mono font-medium"
                />
              </AppFormItem>

              {/* 发布状态 */}
              <div className="pt-3 border-t border-border">
                <AppCheckbox
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  label="启用并发布此操作视频"
                />
              </div>
            </AppFormMetaPanel>
          </div>
        </div>

        {/* Submit Buttons */}
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
