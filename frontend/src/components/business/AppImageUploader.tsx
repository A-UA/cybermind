import React, { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { Upload, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

interface AppImageUploaderProps {
  value: string                     // 双向绑定的图片 URL 字符串
  onChange: (url: string) => void  // 变更时的回调函数
  disabled?: boolean                // 禁用状态
}

export function AppImageUploader({
  value,
  onChange,
  disabled = false
}: AppImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // 图片直传 API 逻辑
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data.data.url
    },
    onMutate: () => {
      setUploading(true)
    },
    onSuccess: (url) => {
      onChange(url)
      setUploading(false)
      toast.success('图片上传成功')
    },
    onError: (err: any) => {
      setUploading(false)
      const msg = err.response?.data?.message || '图片上传失败'
      toast.error(`上传出错: ${msg}`)
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
    // 归零 input file value，避免同一文件重复选择无法触发事件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-3 font-sans text-[13px]">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="请输入图片 URL 或点击右侧本地上传"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground outline-none text-[13px] placeholder-muted-foreground/60 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={disabled || uploading}
          className="px-4 py-2.5 border border-border bg-card hover:bg-accent text-foreground font-medium flex items-center gap-1.5 transition-all rounded-xl cursor-pointer disabled:opacity-50 text-[13px]"
        >
          {uploading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Upload className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
          )}
          <span>{uploading ? '上传中...' : '本地上传'}</span>
        </button>
      </div>

      {/* 图片预览，悬停浮现删除按钮 */}
      {value && (
        <div className="relative p-1.5 border border-border bg-accent/30 w-32 h-20 rounded-xl overflow-hidden flex items-center justify-center group">
          <img src={value} alt="上传预览" className="max-w-full max-h-full object-contain rounded-lg" />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            className="absolute top-1.5 right-1.5 p-1 bg-destructive text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
            title="移除图片"
          >
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )
}

export default AppImageUploader
