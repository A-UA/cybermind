import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
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
      // 找出这个用户当前拥有的角色 id 列表，并预勾选
      const currentRoleIds = roles
        .filter((r) => user.roles.includes(r.code))
        .map((r) => r.id)
      setTempRoleIds(currentRoleIds)
    } else {
      setTempRoleIds([])
    }
  }, [user, roles, isOpen])

  if (!isOpen || !user) return null

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-xs font-sans text-foreground">
      <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-sm w-full overflow-hidden flex flex-col justify-between">
        
        {/* 顶部 */}
        <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-foreground">
            角色授权: {user.username}
          </h3>
          <button
            onClick={onClose}
            className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 勾选内容 */}
        <div className="p-6 bg-background space-y-4">
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border bg-background hover:bg-accent rounded-lg font-bold cursor-pointer text-xs"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold rounded-lg pop-shadow-sm pop-press cursor-pointer text-xs disabled:opacity-60"
            >
              {isSaving ? '提交中...' : '提交更改'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
