import React, { useState, useEffect } from 'react'
import AppFormItem from '@/components/common/AppFormItem'
import AppInput from '@/components/common/AppInput'
import AppTextarea from '@/components/common/AppTextarea'
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

    const payload: {
      name: string
      description: string | null
      code?: string
    } = {
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
    >
      <form onSubmit={handleSubmit} className="p-6 bg-card space-y-4 font-sans text-[13px] text-foreground">
        {/* 角色名称 */}
        <AppFormItem label="角色名称" required error={nameError}>
          <AppInput
            type="text"
            placeholder="例如：内容管理员..."
            value={roleNameVal}
            onChange={(e) => {
              setRoleNameVal(e.target.value)
              if (e.target.value.trim()) setNameError('')
            }}
          />
        </AppFormItem>

        {/* 角色标识/代码 */}
        <AppFormItem label="角色标识代码 (创建后不可更改)" required={!role} error={codeError}>
          <AppInput
            type="text"
            required={!role}
            disabled={!!role}
            placeholder="例如：content_admin (仅字母与下划线)..."
            value={roleCodeVal}
            onChange={(e) => {
              setRoleCodeVal(e.target.value)
              if (e.target.value.trim()) setCodeError('')
            }}
          />
        </AppFormItem>

        {/* 角色描述 */}
        <AppFormItem label="角色职责描述">
          <AppTextarea
            rows={3}
            placeholder="请输入对该角色权限范围的解释..."
            value={roleDescVal}
            onChange={(e) => setRoleDescVal(e.target.value)}
          />
        </AppFormItem>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2.5 pt-5 border-t border-border">
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
