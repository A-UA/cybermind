import React, { useState, useEffect } from 'react'
import { Shield, X } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import type { IRole } from '../types'

interface RoleFormModalProps {
  isOpen: boolean
  role: IRole | null
  onClose: () => void
  onSave: (payload: {
    name: string
    code?: string
    description: string | null
  }) => Promise<void>
  isSaving: boolean
}

export default function RoleFormModal({
  isOpen,
  role,
  onClose,
  onSave,
  isSaving
}: RoleFormModalProps) {
  const [roleNameVal, setRoleNameVal] = useState('')
  const [roleCodeVal, setRoleCodeVal] = useState('')
  const [roleDescVal, setRoleDescVal] = useState('')

  const [nameError, setNameError] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    if (role) {
      setRoleNameVal(role.name)
      setRoleCodeVal(role.code)
      setRoleDescVal(role.description || '')
    } else {
      setRoleNameVal('')
      setRoleCodeVal('')
      setRoleDescVal('')
    }
    setNameError('')
    setCodeError('')
  }, [role, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!roleNameVal.trim()) {
      setNameError('角色中文名称不能为空')
      hasError = true
    } else {
      setNameError('')
    }

    if (!role && !roleCodeVal.trim()) {
      setCodeError('角色标识代码不能为空')
      hasError = true
    } else {
      setCodeError('')
    }

    if (hasError) return

    const payload: any = {
      name: roleNameVal.trim(),
      description: roleDescVal.trim() || null
    }

    if (!role) {
      payload.code = roleCodeVal.trim()
    }

    await onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-xs font-sans text-foreground">
      <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-md w-full overflow-hidden flex flex-col justify-between">
        
        {/* 顶部 */}
        <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-foreground flex items-center space-x-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span>{role ? '编辑角色基本信息' : '创建新系统角色'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 bg-background space-y-4 font-semibold">
          {/* 角色名称 */}
          <AppFormItem label="角色中文名称 / NAME" required error={nameError}>
            <input
              type="text"
              placeholder="例如：内容管理员..."
              value={roleNameVal}
              onChange={(e) => {
                setRoleNameVal(e.target.value)
                if (e.target.value.trim()) setNameError('')
              }}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-bold text-xs"
            />
          </AppFormItem>

          {/* 角色标识/代码 */}
          <AppFormItem label="角色标识代码 / CODE (创建后不可改)" required={!role} error={codeError}>
            <input
              type="text"
              required={!role}
              disabled={!!role}
              placeholder="例如：content_admin (仅字母与下划线)..."
              value={roleCodeVal}
              onChange={(e) => {
                setRoleCodeVal(e.target.value)
                if (e.target.value.trim()) setCodeError('')
              }}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-mono text-xs disabled:opacity-60"
            />
          </AppFormItem>

          {/* 角色描述 */}
          <AppFormItem label="角色职责描述 / DESCRIPTION">
            <textarea
              rows={3}
              placeholder="请输入对该角色权限范围的解释..."
              value={roleDescVal}
              onChange={(e) => setRoleDescVal(e.target.value)}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none text-xs"
            />
          </AppFormItem>

          {/* 底部按钮 */}
          <div className="flex justify-end space-x-2.5 pt-4 border-t-2 border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border bg-background hover:bg-accent rounded-lg font-bold cursor-pointer text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold rounded-lg pop-shadow-sm pop-press cursor-pointer text-xs disabled:opacity-60"
            >
              {isSaving ? '正在保存...' : '确认保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
