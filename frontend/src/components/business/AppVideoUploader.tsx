import React, { useRef, useState } from 'react'
import apiClient from '@/lib/api'
import { Upload, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

interface AppVideoUploaderProps {
  value: string                              // 视频播放链接 URL
  onChange: (url: string) => void           // 变更时的回调函数
  onDurationChange?: (duration: number) => void // 可选的时长回填回调 (秒数)
  disabled?: boolean                         // 禁用状态
}

export function AppVideoUploader({
  value,
  onChange,
  onDurationChange,
  disabled = false
}: AppVideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  // 视频文件直传后端，带上传进度控制与时长自动提取
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setProgress(0)

    try {
      // 1. 先提取视频时长，完成后再上传
      try {
        const duration = await new Promise<number>((resolve) => {
          const videoElement = document.createElement('video')
          videoElement.preload = 'metadata'
          videoElement.onloadedmetadata = () => {
            URL.revokeObjectURL(videoElement.src)
            resolve(Math.round(videoElement.duration))
          }
          videoElement.onerror = () => resolve(0)
          videoElement.src = URL.createObjectURL(file)
        })
        if (duration > 0 && onDurationChange) {
          onDurationChange(duration)
        }
      } catch {
        // 时长抓取失败不应影响文件本身的上传流程
      }

      // 2. 发送直传 API
      const res = await apiClient.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total)
          setProgress(percentCompleted)
        }
      })

      const url = res.data.data.url
      onChange(url)
      toast.success('视频文件上传成功')
    } catch (err: any) {
      const msg = err.response?.data?.message || '视频上传失败'
      toast.error(`上传出错: ${msg}`)
    } finally {
      setUploading(false)
      setProgress(0)
      // 归零 input value
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-3 font-sans text-[13px]">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="请输入视频 URL 或点击右侧本地上传"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground outline-none text-[13px] placeholder-muted-foreground/60 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleVideoUpload}
          accept="video/*"
          className="hidden"
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="px-4 py-2.5 border border-border bg-card hover:bg-accent text-foreground font-medium flex items-center gap-1.5 transition-all rounded-xl cursor-pointer disabled:opacity-50 text-[13px] whitespace-nowrap"
        >
          {uploading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Upload className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
          )}
          <span>{uploading ? '上传中...' : '选择视频'}</span>
        </button>
      </div>

      {/* 进度条面板 */}
      {uploading && (
        <div className="w-full bg-card border border-border p-4 rounded-xl elevation-1">
          <div className="flex justify-between text-[12px] text-muted-foreground mb-2">
            <span>正在传输视频文件</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 视频预览面板 */}
      {value && !uploading && (
        <div className="relative p-1.5 border border-border bg-accent/20 w-48 rounded-xl overflow-hidden group flex flex-col space-y-1.5">
          <video src={value} controls className="w-full max-h-32 rounded-lg object-cover bg-black" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1.5">
            <span className="truncate flex-1 max-w-[120px] font-mono" title={value.split('/').pop()}>
              {value.split('/').pop()}
            </span>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="p-1 bg-destructive text-white rounded-lg cursor-pointer hover:bg-destructive/80 transition-colors"
              title="移除视频"
            >
              <X className="h-2.5 w-2.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppVideoUploader
