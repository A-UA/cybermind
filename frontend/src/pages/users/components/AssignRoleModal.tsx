import { useState, useEffect } from 'react'
import AppModal from '@/components/common/AppModal'
import AppButton from '@/components/common/AppButton'
import AppCheckbox from '@/components/common/AppCheckbox'
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
    >
      <div className="p-6 bg-card space-y-4 text-[13px] font-sans text-foreground">
        <p className="text-[12px] text-muted-foreground font-medium select-none">
          勾选分配角色
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {roles.map((r) => {
            const isChecked = tempRoleIds.includes(r.id)
            return (
              <AppCheckbox
                key={r.id}
                checked={isChecked}
                onCheckedChange={() => handleCheckboxChange(r.id)}
                label={r.name}
                description={r.code}
              />
            )
          })}
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
