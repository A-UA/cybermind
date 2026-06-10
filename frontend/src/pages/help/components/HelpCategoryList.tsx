import { useState } from 'react'
import { FolderPlus, Plus, Edit, Trash2 } from 'lucide-react'
import type { IHelpCategory } from '../types'

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
    <div className="xl:col-span-1 bg-[#F5EEF8] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow h-fit text-xs">
      <div className="flex pt-5 px-5 items-center justify-between border-b-2 border-border pb-3">
        <h3 className="text-sm font-heading font-bold text-foreground flex items-center space-x-1.5 select-none">
          <FolderPlus className="h-4 w-4 text-primary" />
          <span>类别筛选 / CLASSIFY</span>
        </h3>
        <button
          onClick={handleCreateClick}
          className="p-1 border-2 border-border bg-background rounded-lg hover:bg-accent pop-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title="新增类别"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 类别列表 */}
      <div className="space-y-2 p-5 max-h-[400px] overflow-y-auto">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
            selectedCategoryId === null
              ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
              : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
          }`}
        >
          显示全部 (ALL)
        </button>

        {isLoading ? (
          <div className="text-center py-4 text-xs text-muted-foreground font-semibold">加载类别中...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground/60 font-semibold">暂无任何类别</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all group ${
                selectedCategoryId === cat.id
                  ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                  : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
              }`}
            >
              <button
                onClick={() => onSelectCategory(cat.id)}
                className="flex-1 text-left text-xs font-bold truncate pr-2"
              >
                {cat.name}
              </button>
              <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                <button
                  onClick={() => handleEditClick(cat)}
                  className="p-0.5 bg-background border border-border rounded text-foreground hover:bg-accent cursor-pointer"
                  title="重命名"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-0.5 bg-background border border-border rounded text-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                  title="删除"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分类编辑小表单 */}
      {isOpen && (
        <form onSubmit={handleFormSubmit} className="m-5 mt-0 p-4 bg-background border-2 border-border rounded-lg pop-shadow-sm space-y-4">
          <h4 className="text-[10px] font-heading font-bold uppercase tracking-wider text-foreground">
            {editingCategory ? '重命名分类 / RENAME' : '创建分类 / NEW CATEGORY'}
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="类别名称..."
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-semibold text-xs text-foreground"
              required
            />
            <div className="flex space-x-1.5 justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1.5 border border-border hover:bg-accent rounded-lg font-bold text-[10px] cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 bg-primary text-primary-foreground border-2 border-border pop-shadow-sm rounded-lg font-bold text-[10px] cursor-pointer disabled:opacity-50"
              >
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
