/**
 * AppConfirm — 全局确认弹窗组件
 * 基于 Zustand store 触发，Atelier 风格
 */
import { useConfirmStore } from '@/stores/useConfirmStore'
import { AlertTriangle, X } from 'lucide-react'
import AppButton from './AppButton'

export default function AppConfirm() {
  const { isOpen, title, message, onConfirm, closeConfirm } = useConfirmStore()

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
    closeConfirm()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={closeConfirm}
      />

      {/* 弹窗主体 */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card rounded-2xl elevation-4 animate-scale-in">
        {/* 关闭按钮 */}
        <button
          onClick={closeConfirm}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="p-6">
          {/* 图标 */}
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.75} />
          </div>

          {/* 标题和内容 */}
          <h3 className="text-base font-heading text-foreground mb-2">
            {title || '确认操作'}
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {message || '此操作不可撤销，确认继续？'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-2.5 px-6 pb-5">
          <AppButton variant="secondary" size="sm" onClick={closeConfirm}>
            取消
          </AppButton>
          <AppButton variant="danger" size="sm" onClick={handleConfirm}>
            确认删除
          </AppButton>
        </div>
      </div>
    </div>
  )
}
