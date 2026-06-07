/**
 * AppConfirm — 全局确认弹窗组件
 * 须在 App.tsx 入口处全局挂载一次。业务侧通过 useConfirmStore().showConfirm() 唤起。
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useConfirmStore } from '@/stores/useConfirmStore'

export default function AppConfirm() {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    isLoading,
    onConfirm,
    closeConfirm,
    setIsLoading,
  } = useConfirmStore()

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) closeConfirm()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, closeConfirm])

  // 锁定滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!onConfirm) return
    try {
      setIsLoading(true)
      await onConfirm()
      closeConfirm()
    } catch {
      // 错误由业务侧 mutation onError 处理
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          if (!isLoading) closeConfirm()
        }}
      />

      {/* 确认弹窗主体 */}
      <div
        className="relative bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-sm w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部装饰条 */}
        <div className="p-5 bg-destructive/5 border-b-4 border-border flex items-start space-x-3">
          <div className="w-9 h-9 bg-destructive/10 border-2 border-border rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-sm text-foreground truncate">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="p-4 bg-accent/40 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={closeConfirm}
            disabled={isLoading}
            className="px-4 py-2 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold text-xs rounded-lg pop-shadow-sm pop-press cursor-pointer disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2 bg-destructive text-destructive-foreground border-2 border-border font-heading font-bold text-xs rounded-lg pop-shadow-sm pop-press cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
          >
            {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            <span>{isLoading ? '执行中...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
