import React, { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { IBanner } from '@/types/banner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Upload, AlertCircle, RefreshCw } from 'lucide-react'

interface BannerFormProps {
  isOpen: boolean
  onClose: () => void
  banner?: IBanner | null
  onSuccess: () => void
}

export default function BannerForm({ isOpen, onClose, banner, onSuccess }: BannerFormProps) {
  const isEdit = !!banner
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 表单状态
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)
  
  const [errorMsg, setErrorMsg] = useState('')
  const [uploading, setUploading] = useState(false)

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

  // 文件上传 Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data.url
    },
    onMutate: () => {
      setUploading(true)
      setErrorMsg('')
    },
    onSuccess: (url) => {
      setImageUrl(url)
      setUploading(false)
    },
    onError: (err: any) => {
      setUploading(false)
      const msg = err.response?.data?.message || '文件上传失败'
      setErrorMsg(`上传出错: ${msg}`)
    },
  })

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
        await apiClient.post('/banners/', dataPayload)
      }
    },
    onSuccess: () => {
      onSuccess()
      onClose()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || '保存失败'
      setErrorMsg(msg)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-border/80 max-w-lg p-8 font-sans text-foreground rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-border/60 pb-4 mb-6">
          <DialogTitle className="text-xl font-display font-medium tracking-tight text-foreground italic">
            {isEdit ? '编辑 Banner' : '新建 Banner'}
          </DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 mb-6 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/10 bg-rose-500/5 rounded-xl flex items-center space-x-2 animate-shake">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* 标题 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Banner 标题
            </label>
            <input
              type="text"
              required
              placeholder="请输入标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/20 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all rounded-xl text-foreground placeholder-muted-foreground/60 outline-none text-xs"
            />
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              展示图片
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                placeholder="请输入图片 URL 或点击上传"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/20 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all rounded-xl text-foreground placeholder-muted-foreground/60 outline-none text-xs"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                className="px-4 py-3 border border-border bg-card hover:bg-secondary text-foreground font-semibold flex items-center space-x-1.5 transition-all rounded-xl cursor-pointer disabled:opacity-50 text-xs"
              >
                {uploading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span>{uploading ? '上传中...' : '上传图片'}</span>
              </button>
            </div>
            {imageUrl && (
              <div className="mt-3 p-1 border border-border bg-secondary/20 w-32 h-20 rounded-xl overflow-hidden flex items-center justify-center">
                <img src={imageUrl} alt="预览" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
          </div>

          {/* 跳转链接 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              跳转链接
            </label>
            <input
              type="text"
              placeholder="请输入点击跳转的 URL（选填）"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/20 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all rounded-xl text-foreground placeholder-muted-foreground/60 outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 排序序号 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                排序序号
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/20 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all rounded-xl text-foreground outline-none text-xs"
              />
            </div>

            {/* 启用状态 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                分发状态
              </label>
              <div className="flex items-center h-11 pl-1">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 bg-secondary border-border/80 text-primary focus:ring-0 rounded cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isActive ? '分发启用 (ACTIVE)' : '下线搁置 (INACTIVE)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-6 mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground font-semibold transition-all rounded-xl cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending || uploading}
              className="px-6 py-2.5 bg-[#111622] hover:bg-[#1e2536] dark:bg-[#e2e8f0] dark:hover:bg-[#f3f4f6] text-white dark:text-black font-semibold transition-all rounded-xl cursor-pointer disabled:opacity-50"
            >
              <span>{submitMutation.isPending ? '保存中...' : '确认保存'}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
