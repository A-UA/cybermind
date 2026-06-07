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
      // 1. 尝试在本地前端提取视频元数据中的视频时长
      let fileDuration = 0
      try {
        const videoElement = document.createElement('video')
        videoElement.src = URL.createObjectURL(file)
        videoElement.onloadedmetadata = () => {
          fileDuration = Math.round(videoElement.duration)
          if (onDurationChange) {
            onDurationChange(fileDuration)
          }
          // 释放本地 Blob 资源
          URL.revokeObjectURL(videoElement.src)
        }
      } catch (err) {
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
    <div className="space-y-3 font-sans text-xs">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="请输入视频 URL 或点击右侧本地上传"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="flex-1 px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold disabled:opacity-60"
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
          className="px-4 py-3 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold flex items-center space-x-1.5 transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 text-xs whitespace-nowrap"
        >
          {uploading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-primary" />
          )}
          <span>{uploading ? '上传中...' : '选择视频'}</span>
        </button>
      </div>

      {/* 进度条面板 - 高对比度撞色视觉 */}
      {uploading && (
        <div className="w-full bg-background border-2 border-border p-3.5 rounded-lg pop-shadow-sm">
          <div className="flex justify-between font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-mono">
            <span>正在传输视频文件 // TRANSFERRING_FILE</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-accent border-2 border-border h-4 rounded overflow-hidden relative">
            <div
              className="bg-primary h-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 视频预览面板，带悬浮移除按钮 */}
      {value && !uploading && (
        <div className="relative p-1.5 border-2 border-border bg-accent/20 w-48 rounded-lg overflow-hidden pop-shadow-sm group flex flex-col space-y-1.5">
          <video src={value} controls className="w-full max-h-32 rounded object-cover bg-black" />
          <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground font-bold px-1.5">
            <span className="truncate flex-1 max-w-[120px]" title={value.split('/').pop()}>
              {value.split('/').pop()}
            </span>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="p-1 bg-destructive text-destructive-foreground border border-border rounded cursor-pointer hover:bg-destructive/80 transition-colors"
              title="移除视频"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppVideoUploader
