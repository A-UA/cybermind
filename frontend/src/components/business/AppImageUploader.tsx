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
    <div className="space-y-3 font-sans text-xs">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="请输入图片 URL 或点击右侧本地上传"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="flex-1 px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold disabled:opacity-60"
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
          className="px-4 py-3 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold flex items-center space-x-1.5 transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 text-xs"
        >
          {uploading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-primary" />
          )}
          <span>{uploading ? '上传中...' : '本地上传'}</span>
        </button>
      </div>

      {/* 图片效果与预览，悬停浮现删除按钮 */}
      {value && (
        <div className="relative p-1.5 border-2 border-border bg-accent/20 w-32 h-20 rounded-lg overflow-hidden flex items-center justify-center pop-shadow-sm group">
          <img src={value} alt="上传预览" className="max-w-full max-h-full object-contain rounded" />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
            title="移除图片"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export default AppImageUploader
