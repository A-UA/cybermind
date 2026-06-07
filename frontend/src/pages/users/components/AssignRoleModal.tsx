import { useState, useEffect } from 'react'
import AppModal from '@/components/common/AppModal'
import AppButton from '@/components/common/AppButton'
import type { IUser, IRole } from '../types'

interface AssignRoleModalProps {
  isOpen: boolean
  user: IUser | null
  roles: IRole[]
  onClose: () => void
  onSave: (roleIds: number[]) => Promise<void>
  isSaving: boolean
}

export default function AssignRoleModal({
  isOpen,
  user,
  roles,
  onClose,
  onSave,
  isSaving
}: AssignRoleModalProps) {
  const [tempRoleIds, setTempRoleIds] = useState<number[]>([])

  useEffect(() => {
    if (user) {
      // 找出这个用户当前拥拥有角色的 id 列表，并预勾选
      const currentRoleIds = roles
        .filter((r) => user.roles.includes(r.code))
        .map((r) => r.id)
      setTempRoleIds(currentRoleIds)
    } else {
      setTempRoleIds([])
    }
  }, [user, roles, isOpen])

  if (!user) return null

  const handleCheckboxChange = (roleId: number) => {
    setTempRoleIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const handleSubmit = async () => {
    await onSave(tempRoleIds)
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`角色授权: ${user.username}`}
      size="sm"
      sticker="AUTHORIZE"
    >
      <div className="p-6 bg-background space-y-4 text-xs font-sans text-foreground">
        <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase select-none">
          勾选分配角色 / ATTACH_ROLES
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {roles.map((r) => {
            const isChecked = tempRoleIds.includes(r.id)
            return (
              <label
                key={r.id}
                className="flex items-center space-x-2.5 px-3 py-2 border-2 border-border rounded-lg bg-background hover:bg-accent/20 cursor-pointer select-none transition-all"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(r.id)}
                  className="w-4 h-4 text-primary border-2 border-border rounded cursor-pointer focus:ring-0"
                />
                <div>
                  <p className="font-bold text-foreground">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{r.code}</p>
                </div>
              </label>
            )
          })}
        </div>

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
            onClick={handleSubmit}
            loading={isSaving}
          >
            提交更改
          </AppButton>
        </div>
      </div>
    </AppModal>
  )
}
