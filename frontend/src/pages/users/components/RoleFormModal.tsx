import React, { useState, useEffect } from 'react'
import AppFormItem from '@/components/common/AppFormItem'
import AppModal from '@/components/common/AppModal'
import AppButton from '@/components/common/AppButton'
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
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? '编辑角色基本信息' : '创建新系统角色'}
      size="md"
      sticker="ROLE"
    >
      <form onSubmit={handleSubmit} className="p-6 bg-background space-y-4 font-semibold text-xs text-foreground">
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
          <AppButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            取消
          </AppButton>
          <AppButton
            type="submit"
            loading={isSaving}
          >
            确认保存
          </AppButton>
        </div>
      </form>
    </AppModal>
  )
}
