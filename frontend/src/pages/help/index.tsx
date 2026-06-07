import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, Trash2, Edit, RefreshCw, HelpCircle, Save, FolderPlus, ArrowLeft } from 'lucide-react'
import AppRichEditor from '@/components/common/AppRichEditor'

interface IHelpCategory {
  id: number
  name: string
  sort_order: number
}

interface IHelpQuestion {
  id: number
  category_id: number
  question: string
  answer: string
  sort_order: number
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
}

export default function HelpPage() {
  // 问题主视图: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingQuestion, setEditingQuestion] = useState<IHelpQuestion | null>(null)

  // 选中分类 ID 进行关联联动 (null 代表全部)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 新增/修改分类的小表单状态
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<IHelpCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categorySort, setCategorySort] = useState(0)

  // 问题表单状态
  const [questionText, setQuestionText] = useState('')
  const [answerContent, setAnswerContent] = useState('')
  const [questionCategoryId, setQuestionCategoryId] = useState<number | ''>('')
  const [questionSort, setQuestionSort] = useState(0)
  const [questionActive, setQuestionActive] = useState(true)

  // 1. 获取分类列表
  const { data: categories = [], isLoading: isCategoriesLoading, refetch: refetchCategories } = useQuery<IHelpCategory[]>({
    queryKey: ['help-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/help/categories')
      return res.data.data
    }
  })

  // 2. 获取问题列表
  const { data: questions = [], isLoading: isQuestionsLoading, refetch: refetchQuestions } = useQuery<IHelpQuestion[]>({
    queryKey: ['help-questions', selectedCategoryId, searchQuery],
    queryFn: async () => {
      const params: any = {}
      if (selectedCategoryId !== null) params.category_id = selectedCategoryId
      if (searchQuery.trim()) params.query = searchQuery
      const res = await apiClient.get('/help/questions', { params })
      return res.data.data
    }
  })

  // --- 分类 Mutation ---

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: categoryName, sort_order: categorySort }
      if (editingCategory) {
        await apiClient.put(`/help/categories/${editingCategory.id}`, payload)
      } else {
        await apiClient.post('/help/categories', payload)
      }
    },
    onSuccess: () => {
      toast.success(editingCategory ? '分类更名成功' : '新增常见问题分类成功')
      setIsCategoryFormOpen(false)
      setEditingCategory(null)
      setCategoryName('')
      setCategorySort(0)
      refetchCategories()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作分类失败')
    }
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/help/categories/${id}`)
    },
    onSuccess: () => {
      toast.success('分类已成功擦除')
      if (selectedCategoryId === editingCategory?.id) {
        setSelectedCategoryId(null)
      }
      refetchCategories()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '删除分类失败')
    }
  })

  // --- 问答 Mutation ---

  const saveQuestionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        category_id: Number(questionCategoryId),
        question: questionText,
        answer: answerContent,
        sort_order: questionSort,
        is_active: questionActive
      }

      if (view === 'edit' && editingQuestion) {
        await apiClient.put(`/help/questions/${editingQuestion.id}`, payload)
      } else {
        await apiClient.post('/help/questions', payload)
      }
    },
    onSuccess: () => {
      toast.success(view === 'edit' ? '常见问答更新成功' : '新增常见问答成功')
      setView('list')
      refetchQuestions()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存问答数据失败')
    }
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/help/questions/${id}`)
    },
    onSuccess: () => {
      toast.success('常见问答已成功物理删除')
      refetchQuestions()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '操作失败')
    }
  })

  // 快捷改变状态
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activeVal }: { id: number; activeVal: boolean }) => {
      await apiClient.put(`/help/questions/${id}`, { is_active: activeVal })
    },
    onSuccess: () => {
      toast.success('问答前台分发状态已改变')
      refetchQuestions()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '更新状态失败')
    }
  })

  const handleEditQuestionClick = (q: IHelpQuestion) => {
    setEditingQuestion(q)
    setQuestionText(q.question)
    setAnswerContent(q.answer)
    setQuestionCategoryId(q.category_id)
    setQuestionSort(q.sort_order)
    setQuestionActive(q.is_active)
    setView('edit')
  }

  const handleCreateQuestionClick = () => {
    if (categories.length === 0) {
      toast.error('请先在左侧建立常见问题分类！')
      return
    }
    setEditingQuestion(null)
    setQuestionText('')
    setAnswerContent('')
    setQuestionCategoryId(selectedCategoryId || categories[0].id)
    setQuestionSort(0)
    setQuestionActive(true)
    setView('create')
  }

  const handleCategoryEditClick = (cat: IHelpCategory) => {
    setEditingCategory(cat)
    setCategoryName(cat.name)
    setCategorySort(cat.sort_order)
    setIsCategoryFormOpen(true)
  }

  const handleCategoryCreateClick = () => {
    setEditingCategory(null)
    setCategoryName('')
    setCategorySort(0)
    setIsCategoryFormOpen(true)
  }

  const handleCategoryDelete = (id: number) => {
    if (window.confirm('确认要删除此分类吗？若分类下含有问答关联，操作将被系统阻断。')) {
      deleteCategoryMutation.mutate(id)
    }
  }

  const handleQuestionDelete = (id: number) => {
    if (window.confirm('确认要物理删除此问答项吗？此操作不可撤销。')) {
      deleteQuestionMutation.mutate(id)
    }
  }

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) {
      toast.error('问题内容不能为空')
      return
    }
    if (!answerContent.trim()) {
      toast.error('答案回复内容不能为空')
      return
    }
    if (!questionCategoryId) {
      toast.error('请选择所属分类')
      return
    }
    saveQuestionMutation.mutate()
  }

  // 渲染列表联合控制面板
  if (view === 'list') {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-foreground font-sans">
        
        {/* 左侧：分类控制板 (薰衣草紫底色) */}
        <div className="xl:col-span-1 bg-[#F5EEF8] dark:bg-[#1E293B] border-2 border-border rounded-xl p-5 pop-shadow h-fit space-y-5">
          <div className="flex items-center justify-between border-b-2 border-border pb-3">
            <h3 className="text-sm font-heading font-bold text-foreground flex items-center space-x-1.5 select-none">
              <FolderPlus className="h-4 w-4 text-primary" />
              <span>类别筛选 / CLASSIFY</span>
            </h3>
            <button
              onClick={handleCategoryCreateClick}
              className="p-1 border-2 border-border bg-background rounded-lg hover:bg-accent pop-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              title="新增类别"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 类别列表 */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                selectedCategoryId === null
                  ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                  : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
              }`}
            >
              显示全部 (ALL)
            </button>

            {isCategoriesLoading ? (
              <div className="text-center py-4 text-xs text-muted-foreground font-semibold">加载类别中...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground/60 font-semibold">暂无任何类别</div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg border-2 transition-all group ${
                    selectedCategoryId === cat.id
                      ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[1px] -translate-y-[1px]'
                      : 'bg-background text-foreground border-transparent hover:border-border hover:pop-shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="flex-1 text-left text-xs font-bold truncate pr-2"
                  >
                    {cat.name}
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                    <button
                      onClick={() => handleCategoryEditClick(cat)}
                      className="p-0.5 bg-background border border-border rounded text-foreground hover:bg-accent cursor-pointer"
                      title="重命名"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleCategoryDelete(cat.id)}
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

          {/* 分类浮动小表单卡片 */}
          {isCategoryFormOpen && (
            <div className="p-4 bg-background border-2 border-border rounded-lg pop-shadow-sm space-y-4">
              <h4 className="text-[10px] font-heading font-bold uppercase tracking-wider text-foreground">
                {editingCategory ? '重命名分类 / RENAME' : '创建分类 / NEW CATEGORY'}
              </h4>
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="类别名称..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-semibold text-xs text-foreground"
                />
                <div className="flex space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCategoryFormOpen(false)}
                    className="px-2.5 py-1.5 border border-border hover:bg-accent rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => saveCategoryMutation.mutate()}
                    className="px-3 py-1.5 bg-primary text-primary-foreground border-2 border-border pop-shadow-sm rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：问答控制列表 (大面板) */}
        <div className="xl:col-span-3 space-y-6">
          {/* 操作过滤条 */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
                常见问题与解答管理
              </h2>
              {(isQuestionsLoading) && (
                <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* 问题关键字搜索 */}
              <input
                type="text"
                placeholder="搜索常见问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold placeholder-muted-foreground/60 w-48"
              />

              <button
                onClick={() => refetchQuestions()}
                className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                title="刷新数据"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={handleCreateQuestionClick}
                className="px-4 py-2 bg-primary text-primary-foreground font-heading font-bold flex items-center space-x-1.5 transition-all border-2 border-border pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>新增问答 ADD Q&A</span>
              </button>
            </div>
          </div>

          {/* 表格数据层 */}
          <div className="border-2 border-border bg-card pop-shadow rounded-xl overflow-hidden">
            {isQuestionsLoading ? (
              <div className="h-64 flex flex-col justify-center items-center space-y-3">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold">正在同步帮助中心数据...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="h-64 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-muted-foreground font-semibold">此分类下暂无问题解答记录</span>
              </div>
            ) : (
              <Table className="text-xs">
                <TableHeader className="bg-accent border-b-2 border-border">
                  <TableRow className="border-b-2 border-border hover:bg-transparent">
                    <TableHead className="font-bold text-foreground w-14">ID</TableHead>
                    <TableHead className="font-bold text-foreground">常见问题 Question</TableHead>
                    <TableHead className="font-bold text-foreground w-36">所属分类</TableHead>
                    <TableHead className="font-bold text-foreground w-20 text-center">排序</TableHead>
                    <TableHead className="font-bold text-foreground w-24 text-center">分发状态</TableHead>
                    <TableHead className="font-bold text-foreground w-28 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q) => (
                    <TableRow
                      key={q.id}
                      className="border-b-2 border-border hover:bg-secondary/40 transition-colors"
                    >
                      {/* ID */}
                      <TableCell className="font-bold text-muted-foreground/80 font-mono">
                        #{q.id}
                      </TableCell>

                      {/* 问题 */}
                      <TableCell className="font-bold text-foreground truncate max-w-sm">
                        {q.question}
                      </TableCell>

                      {/* 所属类别 */}
                      <TableCell>
                        <span className="px-2 py-0.5 border-2 border-border bg-[#F5EEF8] dark:bg-slate-800 text-foreground text-[10px] font-bold rounded-lg pop-shadow-sm select-none">
                          {categories.find((c) => c.id === q.category_id)?.name || '未分类'}
                        </span>
                      </TableCell>

                      {/* 排序 */}
                      <TableCell className="text-center font-bold text-muted-foreground font-mono">
                        {q.sort_order}
                      </TableCell>

                      {/* 状态徽章贴纸 */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full inline-block border-2 border-border ${q.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/35'}`} />
                          <span className={`text-[10px] font-bold ${q.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/60'}`}>
                            {q.is_active ? '分发中' : '下线'}
                          </span>
                        </div>
                      </TableCell>

                      {/* 操作 */}
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleEditQuestionClick(q)}
                            className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                            title="编辑问答"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          
                          {/* 快捷启用/禁用 */}
                          {q.is_active ? (
                            <button
                              onClick={() => toggleActiveMutation.mutate({ id: q.id, activeVal: false })}
                              className="px-2 py-1.5 border-2 border-border bg-amber-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase"
                              title="下架"
                            >
                              下线
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleActiveMutation.mutate({ id: q.id, activeVal: true })}
                              className="px-2 py-1.5 border-2 border-border bg-emerald-400 text-black font-bold text-[9px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] pop-shadow-sm transition-all rounded-lg cursor-pointer uppercase"
                              title="上架"
                            >
                              启用
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleQuestionDelete(q.id)}
                            className="p-1.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-destructive transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
                            title="删除问答"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 渲染编辑或新建表单 (右侧平铺大表单)
  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部控制栏 */}
      <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView('list')}
            className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground rounded-lg pop-shadow-sm pop-press cursor-pointer flex items-center justify-center"
            title="返回问答列表"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
              {view === 'edit' ? '编辑常见问答 / EDIT FAQ' : '创建常见问答 / CREATE FAQ'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">请录入常见问题与富文本格式的回答内容</p>
          </div>
        </div>

        {/* 贴纸 */}
        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3.5deg] hidden sm:inline-block">
          Q&A PANEL
        </div>
      </div>

      {/* 常见问题表单 */}
      <form onSubmit={handleQuestionSubmit} className="bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧大块：问题与富文本答案 (两列宽) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 问题内容 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                常见问题内容 / QUESTION
              </label>
              <input
                type="text"
                required
                placeholder="请输入常见问题内容，例如：如何找回登录密码？"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-bold"
              />
            </div>

            {/* 富文本答案 */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                问题解答详情 / ANSWER DETAILS
              </label>
              <AppRichEditor value={answerContent} onChange={setAnswerContent} />
            </div>
          </div>

          {/* 右侧窄块：关联分类等元属性 (一列宽) */}
          <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
            <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
              分类与排序配置 / SCHEME
            </h3>

            {/* 所属分类选择 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground uppercase block">
                所属常见问题分类 / BELONGS TO
              </label>
              <Select
                value={String(questionCategoryId)}
                onValueChange={(val) => setQuestionCategoryId(val ? Number(val) : '')}
              >
                <SelectTrigger className="w-full h-10 bg-background border-2 border-border text-foreground text-xs rounded-lg focus:ring-0 font-bold">
                  <SelectValue placeholder="选择所属分类" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border text-foreground rounded-lg text-xs font-semibold">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 排序序号 */}
            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-foreground uppercase block">
                排序序号 / SORT ORDER
              </label>
              <input
                type="number"
                value={questionSort}
                onChange={(e) => setQuestionSort(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
              />
            </div>

            {/* 分发状态 */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={questionActive}
                  onChange={(e) => setQuestionActive(e.target.checked)}
                  className="w-4 h-4 bg-background border-2 border-border text-primary focus:ring-0 rounded-md cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">
                  启用此常见问题解答 (ACTIVE)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 提交/取消 按钮栏 */}
        <div className="flex justify-end space-x-3 border-t-2 border-border pt-6 mt-6">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-5 py-2.5 border-2 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer"
          >
            取消 CANCEL
          </button>
          <button
            type="submit"
            disabled={saveQuestionMutation.isPending}
            className="px-8 py-2.5 bg-primary text-primary-foreground border-2 border-border font-heading font-bold transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            {saveQuestionMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>确认保存 SUBMIT</span>
          </button>
        </div>
      </form>
    </div>
  )
}
