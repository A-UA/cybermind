import React, { useState, useEffect } from 'react'
import { Key, X } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
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

  if (!isOpen) return null

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

    const payload: any = {
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-xs font-sans text-foreground">
      <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-md w-full overflow-hidden flex flex-col justify-between">
        
        {/* 顶部 */}
        <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-foreground flex items-center space-x-1.5">
            <Key className="h-4 w-4 text-primary" />
            <span>{user ? '编辑管理员属性' : '新增管理员账户'}</span>
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
          {/* 用户名 */}
          <AppFormItem label="账户名 / USERNAME (创建后不可改)" required={!user} error={usernameError}>
            <input
              type="text"
              required={!user}
              disabled={!!user}
              placeholder="请输入登录账户名..."
              value={usernameVal}
              onChange={(e) => {
                setUsernameVal(e.target.value)
                if (e.target.value.trim()) setUsernameError('')
              }}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-bold text-xs disabled:opacity-60"
            />
          </AppFormItem>

          {/* 密码 */}
          <AppFormItem 
            label={user ? '登录密码 / PASSWORD (留空代表不修改)' : '登录密码 / PASSWORD (最少 8 位)'} 
            required={!user} 
            error={passwordError}
          >
            <input
              type="password"
              required={!user}
              placeholder={user ? '不修改请留空...' : '输入至少8位密码...'}
              value={passwordVal}
              onChange={(e) => {
                setPasswordVal(e.target.value)
                if (e.target.value.length >= 8 || user) setPasswordError('')
              }}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-mono text-xs"
            />
          </AppFormItem>

          {/* 昵称 */}
          <AppFormItem label="昵称 / DISPLAY NICKNAME">
            <input
              type="text"
              placeholder="输入昵称..."
              value={nicknameVal}
              onChange={(e) => setNicknameVal(e.target.value)}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none text-xs"
            />
          </AppFormItem>

          {/* 邮箱 */}
          <AppFormItem label="电子邮箱 / EMAIL">
            <input
              type="email"
              placeholder="例如 info@example.com"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none text-xs"
            />
          </AppFormItem>

          {/* 启用状态 */}
          <div className="pt-2 border-t border-border/20">
            <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActiveVal}
                onChange={(e) => setIsActiveVal(e.target.checked)}
                className="w-4 h-4 bg-background border-2 border-border text-primary focus:ring-0 rounded-md cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground">启用此管理员账号 (ACTIVE)</span>
            </label>
          </div>

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
