import { useState, useEffect } from 'react'
import { CheckSquare } from 'lucide-react'
import AppModal from '@/components/common/AppModal'
import AppButton from '@/components/common/AppButton'
import type { IRole, IPermission } from '../types'

interface AssignPermModalProps {
  isOpen: boolean
  role: IRole | null
  permissions: IPermission[]
  onClose: () => void
  onSave: (permissionIds: number[]) => Promise<void>
  isSaving: boolean
}

// 模块中文对照字典
const MODULE_NAME_MAP: Record<string, string> = {
  user: '用户管理',
  role: '角色权限',
  banner: '轮播图管理',
  news: '新闻资讯',
  contact: '客户留言',
  help: '帮助中心',
  video: '操作视频',
  config: '系统配置',
  stats: '数据看板'
}

export default function AssignPermModal({
  isOpen,
  role,
  permissions,
  onClose,
  onSave,
  isSaving
}: AssignPermModalProps) {
  const [tempPermIds, setTempPermIds] = useState<number[]>([])

  useEffect(() => {
    if (role) {
      // 找出这个角色当前拥有的权限 id 列表，并预勾选
      const currentPermIds = permissions
        .filter((p) => role.permissions.includes(p.code))
        .map((p) => p.id)
      setTempPermIds(currentPermIds)
    } else {
      setTempPermIds([])
    }
  }, [role, permissions, isOpen])

  if (!role) return null

  // 权限按 Module 分组
  const groupedPermissions = permissions.reduce<Record<string, IPermission[]>>((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = []
    acc[curr.module].push(curr)
    return acc
  }, {})

  const handleCheckboxChange = (permId: number) => {
    setTempPermIds((prev) => {
      if (prev.includes(permId)) {
        return prev.filter((id) => id !== permId)
      } else {
        return [...prev, permId]
      }
    })
  }

  const handleSubmit = async () => {
    await onSave(tempPermIds)
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`角色权限分配: ${role.name}`}
      size="xl"
      sticker="PERMISSIONS"
    >
      <div className="flex flex-col text-xs font-sans text-foreground max-h-[80vh]">
        {/* 分组内容区 */}
        <div className="p-6 bg-background overflow-y-auto space-y-6 flex-1 text-xs">
          {Object.keys(groupedPermissions).map((moduleName) => {
            const perms = groupedPermissions[moduleName]
            const moduleLabel = MODULE_NAME_MAP[moduleName] || moduleName.toUpperCase()

            return (
              <div key={moduleName} className="bg-accent/20 border-2 border-border p-4 rounded-xl space-y-3">
                <h4 className="font-heading font-bold text-foreground border-b border-border/40 pb-1.5 uppercase select-none">
                  {moduleLabel} // {moduleName.toUpperCase()}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {perms.map((p) => {
                    const isChecked = tempPermIds.includes(p.id)
                    return (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 bg-background border border-border/50 hover:border-border px-3 py-2 rounded-lg cursor-pointer select-none transition-all hover:bg-background/80"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(p.id)}
                          className="w-3.5 h-3.5 text-primary border-2 border-border rounded cursor-pointer focus:ring-0"
                        />
                        <div className="text-[11px]">
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{p.code}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 bg-accent border-t-4 border-border flex items-center justify-between flex-shrink-0 sticky bottom-0 z-10">
          <span className="text-[10px] text-muted-foreground font-mono font-semibold">
            当前已勾选 {tempPermIds.length} 项权限 / CHECKED_ITEMS
          </span>
          <div className="flex space-x-2">
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
              icon={<CheckSquare className="h-3.5 w-3.5" />}
            >
              保存更改
            </AppButton>
          </div>
        </div>
      </div>
    </AppModal>
  )
}
