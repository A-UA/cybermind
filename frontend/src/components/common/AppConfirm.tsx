/**
 * AppConfirm — 全局确认弹窗组件
 * V2 极简科技黑风格
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeConfirm}
      />

      {/* 弹窗主体 */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-lg elevation-3 animate-scale-in">
        {/* 关闭按钮 */}
        <button
          onClick={closeConfirm}
          className="absolute top-3.5 right-3.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="p-5">
          {/* 图标 */}
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center mb-3.5">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" strokeWidth={1.5} />
          </div>

          {/* 标题和内容 */}
          <h3 className="text-[14px] font-semibold text-foreground mb-1.5 font-sans">
            {title || '确认操作'}
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {message || '此操作不可撤销，确认继续？'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-2 px-5 pb-4.5">
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
