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
        setImageUrl(banner.image_url)
        setLinkUrl(banner.link_url || '')
        setSortOrder(banner.sort_order)
        setIsActive(banner.is_active)
      } else {
        setTitle('')
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
      title={isEdit ? '编辑 BANNER' : '新建 BANNER'}
      size="lg"
      sticker="FORM PANEL"
    >
      <div className="p-6 font-sans text-foreground">
        {errorMsg && (
          <div className="p-3 mb-6 text-xs text-destructive border-2 border-destructive bg-destructive/5 rounded-lg flex items-center space-x-2 animate-shake font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 标题 */}
          <AppFormItem label="Banner 标题 / TITLE" required>
            <input
              type="text"
              required
              placeholder="请输入标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground placeholder-muted-foreground outline-none text-xs font-semibold"
            />
          </AppFormItem>

          {/* 图片上传 */}
          <AppFormItem label="展示图片 / COVER IMAGE" required>
            <AppImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              disabled={submitMutation.isPending}
            />
          </AppFormItem>

          {/* 跳转链接 */}
          <AppFormItem label="跳转链接 / TARGET LINK">
            <input
              type="text"
              placeholder="请输入点击跳转的 URL（选填）"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground placeholder-muted-foreground outline-none text-xs font-semibold"
            />
          </AppFormItem>

          <div className="grid grid-cols-2 gap-4">
            {/* 排序序号 */}
            <AppFormItem label="排序序号 / SORT ORDER">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </AppFormItem>

            {/* 启用状态 */}
            <AppFormItem label="分发状态 / DISPATCH STATUS">
              <div className="flex items-center h-11 pl-1">
                <AppCheckbox
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  label={
                    <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                      {isActive ? '分发启用 (ACTIVE)' : '下线搁置 (INACTIVE)'}
                    </span>
                  }
                />
              </div>
            </AppFormItem>
          </div>

          <div className="border-t-2 border-border pt-6 mt-6 flex justify-end space-x-2.5">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              取消 CANCEL
            </AppButton>
            <AppButton
              type="submit"
              loading={submitMutation.isPending}
            >
              确认保存 CONFIRM
            </AppButton>
          </div>
        </form>
      </div>
    </AppModal>
  )
}
