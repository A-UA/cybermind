import React, { useState, useEffect } from 'react'
import { FileText, Clock, Mail, Phone, Building, Trash2, CheckSquare, User } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppDrawer from '@/components/common/AppDrawer'
import AppButton from '@/components/common/AppButton'
import AppTextarea from '@/components/common/AppTextarea'
import AppTime from '@/components/common/AppTime'
import type { IContactSubmission } from '../types'

interface ContactDetailDrawerProps {
  submission: IContactSubmission | null
  onClose: () => void
  onDelete: (id: number) => void
  onProcess: (remark: string, status: string) => Promise<void>
  isProcessing: boolean
  isDeleting: boolean
}

export default function ContactDetailDrawer({
  submission,
  onClose,
  onDelete,
  onProcess,
  isProcessing,
  isDeleting
}: ContactDetailDrawerProps) {
  const [remarkText, setRemarkText] = useState('')
  const [processStatus, setProcessStatus] = useState('processed')
  const [remarkError, setRemarkError] = useState('')

  // 用于在关闭动画期间保留数据，避免内容瞬间消失
  const [localSubmission, setLocalSubmission] = useState<IContactSubmission | null>(null)

  useEffect(() => {
    if (submission) {
      setLocalSubmission(submission)
      setRemarkText(submission.remark || '')
      setProcessStatus('processed')
    }
    setRemarkError('')
  }, [submission])

  const activeSubmission = submission || localSubmission

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSubmission) return
    if (!remarkText.trim()) {
      setRemarkError('处理备注批注内容不能为空')
      return
    }
    setRemarkError('')
    await onProcess(remarkText.trim(), processStatus)
  }

  return (
    <AppDrawer
      isOpen={!!submission}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-primary" strokeWidth={1.75} />
          <span className="font-heading text-base text-foreground">留言详细查阅</span>
        </div>
      }
      description={activeSubmission ? `留言 ID: #${activeSubmission.id}` : ''}
      footer={
        activeSubmission && (
          <div className="flex w-full items-center justify-between">
            <AppButton
              type="button"
              variant="ghost"
              loading={isDeleting}
              loadingText="正在删除..."
              onClick={() => onDelete(activeSubmission.id)}
              icon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              物理删除
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              关闭
            </AppButton>
          </div>
        )
      }
    >
      {activeSubmission ? (
        <div className="space-y-4 text-[13px] font-sans">
          {/* 留言主题 */}
          <div className="bg-card border border-border p-4 rounded-lg shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">主题</span>
            <h4 className="font-semibold text-[13px] text-foreground select-all">{activeSubmission.subject}</h4>
          </div>

          {/* 留言正文 */}
          <div className="bg-card border border-border p-4 rounded-lg shadow-sm space-y-1.5">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">留言正文</span>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap select-all">
              {activeSubmission.message}
            </p>
          </div>

          {/* 留言人详情元数据 */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-sm">
            <h4 className="text-[12px] font-semibold border-b border-border pb-2.5 text-foreground">
              留言人登记信息
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" strokeWidth={1.5} />姓名</span>
                <span className="font-medium text-foreground select-all">{activeSubmission.name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" strokeWidth={1.5} />电子邮箱</span>
                <span className="font-medium text-foreground select-all font-mono">{activeSubmission.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" strokeWidth={1.5} />联系电话</span>
                <span className="font-medium text-foreground select-all font-mono">{activeSubmission.phone || '未填写'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Building className="h-3.5 w-3.5" strokeWidth={1.5} />所属公司</span>
                <span className="font-medium text-foreground select-all">{activeSubmission.company || '未填写'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>提交于: <AppTime value={activeSubmission.created_at} format="YYYY-MM-DD HH:mm" /></span>
            </div>
          </div>

          {/* 批注回复历史 (若已处理) */}
          {activeSubmission.status === 'processed' && (
            <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-lg space-y-3">
              <h4 className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider select-none font-mono">
                处理归档意见
              </h4>
              <div className="space-y-2 text-foreground">
                <p className="whitespace-pre-wrap bg-card p-3 rounded-lg border border-border">{activeSubmission.remark}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>处理人: {activeSubmission.processed_by_username || `ID #${activeSubmission.processed_by}`}</span>
                  <span>时间: <AppTime value={activeSubmission.processed_at} format="YYYY-MM-DD HH:mm" /></span>
                </div>
              </div>
            </div>
          )}

          {/* 留言处理批注表单 */}
          <form onSubmit={handleFormSubmit} className="bg-card border border-border p-4 rounded-lg space-y-4 shadow-sm">
            <h4 className="text-[12px] font-semibold text-foreground border-b border-border pb-2.5 select-none">
              客服处理与批注
            </h4>

            <div className="space-y-4">
              <AppFormItem label="批注内容" required error={remarkError}>
                <AppTextarea
                  rows={4}
                  resize="vertical"
                  placeholder="请录入处理意见或批注归档说明..."
                  value={remarkText}
                  onChange={(e) => {
                    setRemarkText(e.target.value)
                    if (e.target.value.trim()) setRemarkError('')
                  }}
                />
              </AppFormItem>

              <div className="flex items-center space-x-6 text-[13px] font-medium pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="processStatus"
                    value="processed"
                    checked={processStatus === 'processed'}
                    onChange={() => setProcessStatus('processed')}
                    className="w-4 h-4 text-primary bg-background border border-border rounded-full focus:ring-0 cursor-pointer"
                  />
                  <span>处理完毕并归档</span>
                </label>
              </div>

              <AppButton
                type="submit"
                variant="primary"
                loading={isProcessing}
                loadingText="正在处理..."
                icon={<CheckSquare className="h-4 w-4" strokeWidth={1.75} />}
                className="w-full"
              >
                确认归档备注
              </AppButton>
            </div>
          </form>
        </div>
      ) : (
        <div />
      )}
    </AppDrawer>
  )
}
