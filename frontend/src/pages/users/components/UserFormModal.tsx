import React, { useState, useEffect } from 'react'
import AppFormItem from '@/components/common/AppFormItem'
import AppInput from '@/components/common/AppInput'
import AppModal from '@/components/common/AppModal'
import AppButton from '@/components/common/AppButton'
import AppCheckbox from '@/components/common/AppCheckbox'
import type { IUser } from '../types'

interface UserFormModalProps {
  isOpen: boolean
  user: IUser | null
  onClose: () => void
  onSave: (payload: {
    nickname: string | null
    email: string | null
    is_active: boolean
    username?: string
    password?: string
  }) => Promise<void>
  isSaving: boolean
}

export default function UserFormModal({
  isOpen,
  user,
  onClose,
  onSave,
  isSaving
}: UserFormModalProps) {
  const [usernameVal, setUsernameVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const [nicknameVal, setNicknameVal] = useState('')
  const [emailVal, setEmailVal] = useState('')
  const [isActiveVal, setIsActiveVal] = useState(true)

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // 初始化或切换编辑对象
  useEffect(() => {
    if (user) {
      setUsernameVal(user.username)
      setPasswordVal('')
      setNicknameVal(user.nickname || '')
      setEmailVal(user.email || '')
      setIsActiveVal(user.is_active)
    } else {
      setUsernameVal('')
      setPasswordVal('')
      setNicknameVal('')
      setEmailVal('')
      setIsActiveVal(true)
    }
    setUsernameError('')
    setPasswordError('')
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!user && !usernameVal.trim()) {
      setUsernameError('管理员账户名不能为空')
      hasError = true
    } else {
      setUsernameError('')
    }

    if (!user && passwordVal.length < 8) {
      setPasswordError('新建账户密码最少为 8 位')
      hasError = true
    } else {
      setPasswordError('')
    }

    if (hasError) return

    const payload: {
      nickname: string | null
      email: string | null
      is_active: boolean
      password?: string
      username?: string
    } = {
      nickname: nicknameVal.trim() || null,
      email: emailVal.trim() || null,
      is_active: isActiveVal
    }

    if (passwordVal.trim()) {
      payload.password = passwordVal
    }

    if (!user) {
      payload.username = usernameVal.trim()
    }

    await onSave(payload)
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? '编辑管理员属性' : '新增管理员账户'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 bg-card space-y-4 font-sans text-[13px] text-foreground">
        {/* 用户名 */}
        <AppFormItem label="账户名 (创建后不可更改)" required={!user} error={usernameError}>
          <AppInput
            type="text"
            required={!user}
            disabled={!!user}
            placeholder="请输入登录账户名..."
            value={usernameVal}
            onChange={(e) => {
              setUsernameVal(e.target.value)
              if (e.target.value.trim()) setUsernameError('')
            }}
          />
        </AppFormItem>

        {/* 密码 */}
        <AppFormItem
          label={user ? '登录密码 (留空代表不修改)' : '登录密码 (最少 8 位)'}
          required={!user}
          error={passwordError}
        >
          <AppInput
            type="password"
            required={!user}
            placeholder={user ? '不修改请留空...' : '输入至少8位密码...'}
            value={passwordVal}
            onChange={(e) => {
              setPasswordVal(e.target.value)
              if (e.target.value.length >= 8 || user) setPasswordError('')
            }}
          />
        </AppFormItem>

        {/* 昵称 */}
        <AppFormItem label="昵称">
          <AppInput
            type="text"
            placeholder="输入昵称..."
            value={nicknameVal}
            onChange={(e) => setNicknameVal(e.target.value)}
          />
        </AppFormItem>

        {/* 邮箱 */}
        <AppFormItem label="电子邮箱">
          <AppInput
            type="email"
            placeholder="例如 info@example.com"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
          />
        </AppFormItem>

        {/* 启用状态 */}
        <div className="pt-3 border-t border-border">
          <AppCheckbox
            checked={isActiveVal}
            onCheckedChange={setIsActiveVal}
            label="启用此管理员账号"
          />
        </div>

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
