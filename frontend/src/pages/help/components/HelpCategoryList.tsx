import { useState } from 'react'
import { FolderPlus, Plus, Edit, Trash2 } from 'lucide-react'
import type { IHelpCategory } from '../types'
import AppButton from '@/components/common/AppButton'
import AppInput from '@/components/common/AppInput'

interface HelpCategoryListProps {
  categories: IHelpCategory[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number | null) => void
  isLoading: boolean

  // 类别增删改操作
  onSaveCategory: (name: string, sortOrder: number, category: IHelpCategory | null) => Promise<void>
  onDeleteCategory: (id: number) => void
}

export default function HelpCategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading,
  onSaveCategory,
  onDeleteCategory
}: HelpCategoryListProps) {
  // 分类表单临时状态
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<IHelpCategory | null>(null)
  const [nameVal, setNameVal] = useState('')
  const [sortVal, setSortVal] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // 当进入编辑或清空时同步状态
  const handleCreateClick = () => {
    setEditingCategory(null)
    setNameVal('')
    setSortVal(0)
    setIsOpen(true)
  }

  const handleEditClick = (cat: IHelpCategory) => {
    setEditingCategory(cat)
    setNameVal(cat.name)
    setSortVal(cat.sort_order)
    setIsOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameVal.trim()) return
    setSubmitting(true)
    try {
      await onSaveCategory(nameVal.trim(), sortVal, editingCategory)
      setIsOpen(false)
      setNameVal('')
      setSortVal(0)
      setEditingCategory(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="xl:col-span-1 bg-card rounded-2xl elevation-1 h-fit text-xs">
      <div className="flex pt-5 px-5 items-center justify-between border-b border-border pb-3">
        <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 select-none">
          <FolderPlus className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <span>类别筛选</span>
        </h3>
        <AppButton
          onClick={handleCreateClick}
          size="iconSm"
          variant="secondary"
          title="新增类别"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </AppButton>
      </div>

      {/* 类别列表 */}
      <div className="space-y-1 p-4 max-h-[400px] overflow-y-auto text-[13px]">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategoryId === null
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          显示全部
        </button>

        {isLoading ? (
          <div className="text-center py-4 text-[13px] text-muted-foreground">加载类别中...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-[13px] text-muted-foreground/60">暂无任何类别</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
                selectedCategoryId === cat.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <button
                onClick={() => onSelectCategory(cat.id)}
                className="flex-1 text-left truncate pr-2 cursor-pointer font-medium"
              >
                {cat.name}
              </button>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button
                  onClick={() => handleEditClick(cat)}
                  className="p-0.5 bg-card border border-border rounded text-foreground hover:bg-accent cursor-pointer transition-colors"
                  title="重命名"
                >
                  <Edit className="h-3 w-3" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-0.5 bg-card border border-border rounded text-foreground hover:bg-destructive hover:text-white cursor-pointer transition-colors"
                  title="删除"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分类编辑小表单 */}
      {isOpen && (
        <form onSubmit={handleFormSubmit} className="m-4 mt-0 p-4 bg-background border border-border rounded-xl space-y-4">
          <h4 className="text-[11px] font-semibold uppercase text-foreground">
            {editingCategory ? '重命名分类' : '创建新分类'}
          </h4>
          <div className="space-y-3">
            <AppInput
              type="text"
              placeholder="类别名称..."
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              required
            />
            <div className="flex gap-1.5 justify-end">
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                取消
              </AppButton>
              <AppButton
                type="submit"
                size="sm"
                loading={submitting}
              >
                保存
              </AppButton>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
