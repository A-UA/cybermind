import React, { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import type { IBanner } from '@/types/banner'
import { AlertCircle } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppImageUploader from '@/components/business/AppImageUploader'
import AppModal from '@/components/common/AppModal'
import AppButton from '@/components/common/AppButton'
import AppCheckbox from '@/components/common/AppCheckbox'
import AppInput from '@/components/common/AppInput'
import AppTextarea from '@/components/common/AppTextarea'

interface BannerFormProps {
  isOpen: boolean
  onClose: () => void
  banner?: IBanner | null
  onSuccess: () => void
}

export default function BannerForm({ isOpen, onClose, banner, onSuccess }: BannerFormProps) {
  const isEdit = !!banner

  // 表单状态
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  const [errorMsg, setErrorMsg] = useState('')

  // 监听 banner 变化以初始化表单
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      if (banner) {
        setTitle(banner.title)
        setDescription(banner.description || '')
        setImageUrl(banner.image_url)
        setLinkUrl(banner.link_url || '')
        setSortOrder(banner.sort_order)
        setIsActive(banner.is_active)
      } else {
        setTitle('')
        setDescription('')
        setImageUrl('')
        setLinkUrl('')
        setSortOrder(0)
        setIsActive(true)
      }
    }
  }, [isOpen, banner])

  // 创建/更新 Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const dataPayload = {
        title,
        description: description || null,
        image_url: imageUrl,
        link_url: linkUrl || null,
        sort_order: sortOrder,
        is_active: isActive,
      }
      if (isEdit && banner) {
        await apiClient.put(`/banners/${banner.id}`, dataPayload)
      } else {
        await apiClient.post('/banners', dataPayload)
      }
    },
    onSuccess: () => {
      onSuccess()
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(getApiErrorMessage(err, '保存失败'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg('标题参数不能为空')
      return
    }
    if (!imageUrl.trim()) {
      setErrorMsg('图片地址不能为空')
      return
    }
    submitMutation.mutate()
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑 Banner' : '新建 Banner'}
      size="lg"
    >
      <div className="p-6 font-sans text-foreground">
        {errorMsg && (
          <div className="p-3 mb-5 text-[12px] text-destructive border border-destructive/20 bg-destructive/5 rounded-lg flex items-center space-x-2 animate-shake font-semibold font-mono">
            <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-[13px]">
          {/* 标题 */}
          <AppFormItem label="Banner 标题" required>
            <AppInput
              type="text"
              required
              placeholder="请输入标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </AppFormItem>

          {/* 描述 */}
          <AppFormItem label="Banner 描述">
            <AppTextarea
              placeholder="请输入描述内容（选填）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              resize="vertical"
            />
          </AppFormItem>

          {/* 图片上传 */}
          <AppFormItem label="展示图片" required>
            <AppImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              disabled={submitMutation.isPending}
            />
          </AppFormItem>

          {/* 跳转链接 */}
          <AppFormItem label="跳转链接">
            <AppInput
              type="text"
              placeholder="请输入点击跳转的 URL（选填）"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </AppFormItem>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 排序序号 */}
            <AppFormItem label="排序序号">
              <AppInput
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="font-mono font-medium"
              />
            </AppFormItem>

            {/* 启用状态 */}
            <AppFormItem label="分发状态">
              <div className="flex items-center h-10 pl-1">
                <AppCheckbox
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  label={
                    <span className={isActive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}>
                      {isActive ? '分发启用' : '下线搁置'}
                    </span>
                  }
                />
              </div>
            </AppFormItem>
          </div>

          <div className="border-t border-border pt-5 mt-6 flex justify-end gap-2.5">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              取消
            </AppButton>
            <AppButton
              type="submit"
              loading={submitMutation.isPending}
            >
              确认保存
            </AppButton>
          </div>
        </form>
      </div>
    </AppModal>
  )
}
