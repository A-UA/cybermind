import React, { useState, useEffect } from 'react'
import { FileText, Clock, Inbox, Mail, Phone, Building, Trash2, CheckSquare } from 'lucide-react'
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
      setProcessStatus(submission.status === 'processed' ? 'processed' : 'processed')
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
      size="xl"
      title={
        <div className="flex items-center space-x-2.5">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-sm text-foreground">留言详细查阅</span>
        </div>
      }
      description={activeSubmission ? `留言ID: #${activeSubmission.id}` : ''}
      footer={
        activeSubmission && (
          <div className="flex w-full items-center justify-between">
            <AppButton
              type="button"
              variant="secondary"
              loading={isDeleting}
              loadingText="正在删除..."
              onClick={() => onDelete(activeSubmission.id)}
              icon={<Trash2 className="h-4 w-4" />}
              className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              物理擦除 REMOVE
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              关闭 CLOSE
            </AppButton>
          </div>
        )
      }
    >
      {activeSubmission ? (
        <div className="space-y-6">
          {/* 留言主题 */}
          <div className="bg-[#FEF9E7] border-2 border-border p-4 rounded-xl pop-shadow-sm space-y-1">
            <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-muted-foreground">主题 // SUBJECT</span>
            <h4 className="font-bold text-sm text-foreground select-all">{activeSubmission.subject}</h4>
          </div>

          {/* 留言正文 */}
          <div className="bg-[#E8F4FD] border-2 border-border p-5 rounded-xl pop-shadow-sm space-y-2.5">
            <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-muted-foreground">留言正文 // MESSAGE_BODY</span>
            <p className="text-foreground text-xs leading-relaxed font-semibold whitespace-pre-wrap select-all">
              {activeSubmission.message}
            </p>
          </div>

          {/* 留言人详情元数据 */}
          <div className="bg-background border-2 border-border rounded-xl p-5 space-y-4">
            <h4 className="text-[10px] font-heading font-bold uppercase tracking-wider border-b border-border/40 pb-2 text-foreground">
              留言人登记信息 // VISITOR METADATA
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Inbox className="h-3 w-3 mr-1" />姓名</span>
                <span className="font-bold text-foreground select-all">{activeSubmission.name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Mail className="h-3 w-3 mr-1" />电子邮箱</span>
                <span className="font-bold text-foreground select-all font-mono">{activeSubmission.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Phone className="h-3 w-3 mr-1" />联系电话</span>
                <span className="font-bold text-foreground select-all font-mono">{activeSubmission.phone || '未填写'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Building className="h-3 w-3 mr-1" />所属公司</span>
                <span className="font-bold text-foreground select-all">{activeSubmission.company || '未填写'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/20 text-[10px] text-muted-foreground font-semibold flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>提交于: <AppTime value={activeSubmission.created_at} /></span>
            </div>
          </div>

          {/* 批注回复历史 (若已处理) */}
          {activeSubmission.status === 'processed' && (
            <div className="bg-emerald-400/10 border-2 border-emerald-500/30 p-5 rounded-xl space-y-3">
              <h4 className="text-[10px] font-heading font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider select-none">
                处理归档意见 // ARCHIVED REMARKS
              </h4>
              <div className="text-xs space-y-2 text-foreground font-semibold">
                <p className="whitespace-pre-wrap bg-background p-3 rounded-lg border border-emerald-500/20">{activeSubmission.remark}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>处理人: {activeSubmission.processed_by_username || `ID #${activeSubmission.processed_by}`}</span>
                  <span>时间: <AppTime value={activeSubmission.processed_at} /></span>
                </div>
              </div>
            </div>
          )}

          {/* 留言处理批注表单 */}
          <form onSubmit={handleFormSubmit} className="bg-accent/20 border-2 border-border p-5 rounded-xl space-y-4">
            <h4 className="text-[10px] font-heading font-bold text-foreground uppercase tracking-wider select-none">
              客服处理与批注 // RESOLUTION ACTION
            </h4>
            
            <div className="space-y-3">
              <AppFormItem label="批注内容 / REMARK COMMENTS" required error={remarkError}>
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

              <div className="flex items-center space-x-6 text-xs font-bold">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="processStatus"
                    value="processed"
                    checked={processStatus === 'processed'}
                    onChange={() => setProcessStatus('processed')}
                    className="w-4 h-4 text-primary bg-background border-2 border-border focus:ring-0 cursor-pointer"
                  />
                  <span>处理完毕归档 (PROCESSED)</span>
                </label>
              </div>

              <AppButton
                type="submit"
                variant="primary"
                loading={isProcessing}
                loadingText="正在处理..."
                icon={<CheckSquare className="h-4 w-4" />}
                className="w-full tracking-wider"
              >
                确认归档备注 SAVE & RESOLVE
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
