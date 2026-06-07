/**
 * useConfirmStore — 全局确认弹窗的 Zustand 状态中心
 * 用法: const { showConfirm } = useConfirmStore()
 *       showConfirm({ title: '确认删除', message: '...', onConfirm: () => mutation.mutate() })
 */
import { create } from 'zustand'

interface ConfirmState {
  /** 弹窗是否展示 */
  isOpen: boolean
  /** 弹窗标题 */
  title: string
  /** 弹窗描述 */
  message: string
  /** 确认按钮文案 */
  confirmText: string
  /** 取消按钮文案 */
  cancelText: string
  /** 确认后是否正在执行异步操作 */
  isLoading: boolean
  /** 确认回调 */
  onConfirm: (() => void | Promise<void>) | null
  /** 打开确认弹窗 */
  showConfirm: (params: {
    title: string
    message: string
    onConfirm: () => void | Promise<void>
    confirmText?: string
    cancelText?: string
  }) => void
  /** 关闭确认弹窗 */
  closeConfirm: () => void
  /** 设置加载态 */
  setIsLoading: (loading: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  isLoading: false,
  onConfirm: null,

  showConfirm: ({ title, message, onConfirm, confirmText, cancelText }) =>
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: confirmText ?? '确认',
      cancelText: cancelText ?? '取消',
      isLoading: false,
    }),

  closeConfirm: () =>
    set({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      isLoading: false,
    }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}))
