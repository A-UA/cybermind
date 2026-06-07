import React, { useState, useEffect } from 'react'
import { FileText, X, Clock, Inbox, Mail, Phone, Building, Trash2, CheckSquare } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
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

  // 同步初始化备注
  useEffect(() => {
    if (submission) {
      setRemarkText(submission.remark || '')
      setProcessStatus(submission.status === 'processed' ? 'processed' : 'processed')
    } else {
      setRemarkText('')
    }
    setRemarkError('')
  }, [submission])

  if (!submission) return null

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!remarkText.trim()) {
      setRemarkError('处理备注批注内容不能为空')
      return
    }
    setRemarkError('')
    await onProcess(remarkText.trim(), processStatus)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end text-xs font-sans text-foreground">
      <div className="bg-card border-l-4 border-border w-full max-w-xl h-full flex flex-col justify-between pop-shadow-lg overflow-y-auto">
        
        {/* 抽屉顶部头部 */}
        <div className="p-5 bg-accent border-b-4 border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground">留言详细查阅</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">留言ID: #{submission.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 抽屉滚动内容 */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto">
          
          {/* 留言主题 */}
          <div className="bg-[#FEF9E7] border-2 border-border p-4 rounded-xl pop-shadow-sm space-y-1">
            <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-muted-foreground">主题 // SUBJECT</span>
            <h4 className="font-bold text-sm text-foreground select-all">{submission.subject}</h4>
          </div>

          {/* 留言正文 */}
          <div className="bg-[#E8F4FD] border-2 border-border p-5 rounded-xl pop-shadow-sm space-y-2.5">
            <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-muted-foreground">留言正文 // MESSAGE_BODY</span>
            <p className="text-foreground text-xs leading-relaxed font-semibold whitespace-pre-wrap select-all">
              {submission.message}
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
                <span className="font-bold text-foreground select-all">{submission.name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Mail className="h-3 w-3 mr-1" />电子邮箱</span>
                <span className="font-bold text-foreground select-all font-mono">{submission.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Phone className="h-3 w-3 mr-1" />联系电话</span>
                <span className="font-bold text-foreground select-all font-mono">{submission.phone || '未填写'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold flex items-center"><Building className="h-3 w-3 mr-1" />所属公司</span>
                <span className="font-bold text-foreground select-all">{submission.company || '未填写'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/20 text-[10px] text-muted-foreground font-semibold flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>提交于: {submission.created_at ? new Date(submission.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</span>
            </div>
          </div>

          {/* 批注回复历史 (若已处理) */}
          {submission.status === 'processed' && (
            <div className="bg-emerald-400/10 border-2 border-emerald-500/30 p-5 rounded-xl space-y-3">
              <h4 className="text-[10px] font-heading font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider select-none">
                处理归档意见 // ARCHIVED REMARKS
              </h4>
              <div className="text-xs space-y-2 text-foreground font-semibold">
                <p className="whitespace-pre-wrap bg-background p-3 rounded-lg border border-emerald-500/20">{submission.remark}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>处理人: {submission.processed_by_username || `ID #${submission.processed_by}`}</span>
                  <span>时间: {submission.processed_at ? new Date(submission.processed_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</span>
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
                <textarea
                  rows={4}
                  placeholder="请录入处理意见或批注归档说明..."
                  value={remarkText}
                  onChange={(e) => {
                    setRemarkText(e.target.value)
                    if (e.target.value.trim()) setRemarkError('')
                  }}
                  className="w-full px-3.5 py-2.5 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold resize-y"
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

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider rounded-lg pop-shadow-sm pop-press flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckSquare className="h-4 w-4" />
                <span>{isProcessing ? '正在处理...' : '确认归档备注 SAVE & RESOLVE'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 抽屉底部操作区 */}
        <div className="p-4 bg-accent border-t-4 border-border flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => onDelete(submission.id)}
            disabled={isDeleting}
            className="px-4 py-2 border-2 border-border bg-background hover:bg-destructive hover:text-destructive-foreground font-heading font-bold text-xs rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center space-x-1.5 text-muted-foreground disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>物理擦除 REMOVE</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold text-xs rounded-lg pop-shadow-sm pop-press cursor-pointer"
          >
            关闭 CLOSE
          </button>
        </div>

      </div>
    </div>
  )
}
