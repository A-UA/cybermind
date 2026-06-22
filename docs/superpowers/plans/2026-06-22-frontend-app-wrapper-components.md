# Frontend App Wrapper Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `frontend/src/pages/` 中重复的 shadcn primitive 用法和 CMS 页面工具区样式抽象为稳定的 `App*` 包装组件，降低页面重复代码并保持视觉一致。

**Architecture:** 不修改 `frontend/src/components/ui/` 下的 shadcn/ui 源码；新增或增强 `frontend/src/components/common/` 中的无业务通用组件，页面层逐步迁移到这些包装组件。优先封装低风险基础控件，再迁移工具栏、状态徽标、表单壳，最后清理 `any` 与重复样式。

**Tech Stack:** React 19, TypeScript strict, Vite, Tailwind CSS 4, shadcn/ui Base UI primitives, lucide-react, pnpm.

---

## File Structure

- Create: `frontend/src/components/common/AppSelect.tsx`
  - 统一封装 shadcn `Select` 的触发器、内容面板、选项渲染和 CMS 默认样式。
- Create: `frontend/src/components/common/AppInput.tsx`
  - 统一文本、数字、邮箱、密码等输入框样式，支持左/右图标。
- Create: `frontend/src/components/common/AppTextarea.tsx`
  - 统一多行输入样式，配合 `AppFormItem` 使用。
- Modify: `frontend/src/components/common/AppButton.tsx`
  - 增加 `size`、`iconOnly`、`success`、`warning` 等变体，覆盖页面内刷新、返回、编辑、删除、发布按钮。
- Create: `frontend/src/components/common/AppStatusBadge.tsx`
  - 提供通用徽标和发布状态、新闻状态、留言状态的轻量映射。
- Create: `frontend/src/components/common/AppToolbar.tsx`
  - 统一列表页顶部工具条布局：标题图标、标题、副标题、loading、filters、actions。
- Create: `frontend/src/components/common/AppFormShell.tsx`
  - 统一编辑页头部、表单卡片、元数据侧栏、底部提交栏的布局原语。
- Create: `frontend/src/components/common/AppStatsCard.tsx`
  - 统一 dashboard、contacts、news 的统计卡样式。
- Create: `frontend/src/components/common/AppDrawer.tsx`
  - 基于现有 `frontend/src/components/ui/sheet.tsx` 封装业务抽屉外观，供留言详情迁移。
- Create: `frontend/src/components/common/AppTabs.tsx`
  - 基于现有 `frontend/src/components/ui/tabs.tsx` 封装 CMS 撞色选项卡。
- Modify: `frontend/src/pages/banners/index.tsx`
- Modify: `frontend/src/pages/news/components/NewsList.tsx`
- Modify: `frontend/src/pages/news/components/NewsForm.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionList.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionForm.tsx`
- Modify: `frontend/src/pages/videos/components/VideoList.tsx`
- Modify: `frontend/src/pages/videos/components/VideoForm.tsx`
- Modify: `frontend/src/pages/users/index.tsx`
- Modify: `frontend/src/pages/users/components/UserTab.tsx`
- Modify: `frontend/src/pages/users/components/RoleTab.tsx`
- Modify: `frontend/src/pages/users/components/UserFormModal.tsx`
- Modify: `frontend/src/pages/users/components/RoleFormModal.tsx`
- Modify: `frontend/src/pages/contacts/components/ContactList.tsx`
- Modify: `frontend/src/pages/contacts/components/ContactDetailDrawer.tsx`
- Modify: `frontend/src/pages/dashboard/components/StatCard.tsx`
- Modify: `frontend/src/pages/news/components/NewsStatsCards.tsx`
- Modify: `frontend/src/pages/site-config/index.tsx`
- Modify: `frontend/src/pages/login/index.tsx`
- Modify: `frontend/src/components/common/AppTable.tsx`
- Modify: `frontend/src/components/business/AppImageUploader.tsx`
- Modify: `frontend/src/components/business/AppVideoUploader.tsx`

## Task 1: Baseline Validation And Scope Guard

**Files:**
- Read: `frontend/package.json`
- Read: `frontend/src/components/common/AppTable.tsx`
- Read: `frontend/src/lib/api.ts`

- [ ] **Step 1: Run current frontend lint**

Run:

```bash
cd frontend
pnpm lint
```

Expected: Record existing failures, if any. Do not fix unrelated failures outside the wrapper-component scope.

- [ ] **Step 2: Run current frontend build**

Run:

```bash
cd frontend
pnpm build
```

Expected: Record existing failures, if any. If build already fails, keep the exact error in the task notes before changing code.

- [ ] **Step 3: Search direct shadcn usage in pages**

Run:

```bash
rg "@/components/ui|<select\b|<input\b|<textarea\b|<button\b" frontend/src/pages -n
```

Expected: Confirm target files match this plan and avoid touching unrelated modules.

- [ ] **Step 4: Commit baseline notes if a tracking file is created**

If a temporary tracking note is created, commit it. Otherwise skip this step.

```bash
git add docs/superpowers/plans/2026-06-22-frontend-app-wrapper-components.md
git commit -m "docs: 记录前端包装组件实施计划"
```

## Task 2: Add AppSelect

**Files:**
- Create: `frontend/src/components/common/AppSelect.tsx`
- Modify: `frontend/src/pages/banners/index.tsx`
- Modify: `frontend/src/pages/news/components/NewsList.tsx`
- Modify: `frontend/src/pages/news/components/NewsForm.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionForm.tsx`
- Modify: `frontend/src/pages/videos/components/VideoList.tsx`

- [ ] **Step 1: Create AppSelect**

Implement:

```tsx
import { type ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface AppSelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

interface AppSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: AppSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
  width?: 'sm' | 'md' | 'full'
}

const WIDTH_CLASS = {
  sm: 'w-28',
  md: 'w-44',
  full: 'w-full',
} as const

export default function AppSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  width = 'md',
}: AppSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg focus:ring-0 font-semibold',
          WIDTH_CLASS[width],
          className,
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn(
          'bg-card border-2 border-border text-foreground rounded-lg text-xs font-semibold',
          contentClassName,
        )}
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 2: Replace Select usage in Banner page**

Modify `frontend/src/pages/banners/index.tsx`:

```tsx
import AppSelect from '@/components/common/AppSelect'
```

Replace shadcn imports and the active-state filter with:

```tsx
<AppSelect
  width="sm"
  value={isActiveFilter}
  onValueChange={(val) => {
    setIsActiveFilter(val || 'all')
    setPage(1)
  }}
  placeholder="全部状态"
  options={[
    { value: 'all', label: '显示全部' },
    { value: 'active', label: '已启用' },
    { value: 'inactive', label: '已下线' },
  ]}
/>
```

- [ ] **Step 3: Replace Select usage in NewsList and NewsForm**

Modify `frontend/src/pages/news/components/NewsList.tsx` and `frontend/src/pages/news/components/NewsForm.tsx`.

Use constants near the component:

```tsx
const NEWS_CATEGORY_OPTIONS = [
  { value: '行业动态', label: '行业动态' },
  { value: '企业新闻', label: '企业新闻' },
  { value: '产品公告', label: '产品公告' },
]

const NEWS_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
]
```

- [ ] **Step 4: Replace Select usage in HelpQuestionForm**

Use:

```tsx
<AppSelect
  width="full"
  value={String(categoryId)}
  onValueChange={(val) => setCategoryId(val ? Number(val) : '')}
  placeholder="选择所属分类"
  options={categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }))}
/>
```

- [ ] **Step 5: Replace native select in VideoList**

Use:

```tsx
<AppSelect
  width="md"
  value={selectedCategory || 'all'}
  onValueChange={(val) => onSelectedCategoryChange(val === 'all' ? '' : val)}
  placeholder="全部视频分类"
  options={[
    { value: 'all', label: '全部视频分类' },
    ...uniqueCategories.map((category) => ({ value: category, label: category })),
  ]}
/>
```

- [ ] **Step 6: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/common/AppSelect.tsx frontend/src/pages/banners/index.tsx frontend/src/pages/news/components/NewsList.tsx frontend/src/pages/news/components/NewsForm.tsx frontend/src/pages/help/components/HelpQuestionForm.tsx frontend/src/pages/videos/components/VideoList.tsx
git commit -m "feat: 封装并应用统一下拉选择组件"
```

## Task 3: Add AppInput And AppTextarea

**Files:**
- Create: `frontend/src/components/common/AppInput.tsx`
- Create: `frontend/src/components/common/AppTextarea.tsx`
- Modify: `frontend/src/pages/news/components/NewsForm.tsx`
- Modify: `frontend/src/pages/videos/components/VideoForm.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionForm.tsx`
- Modify: `frontend/src/pages/site-config/index.tsx`
- Modify: `frontend/src/pages/users/components/UserFormModal.tsx`
- Modify: `frontend/src/pages/users/components/RoleFormModal.tsx`
- Modify: `frontend/src/pages/login/index.tsx`

- [ ] **Step 1: Create AppInput**

Implement:

```tsx
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  inputClassName?: string
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ leftIcon, rightIcon, className, inputClassName, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className={cn('relative flex items-center', className)}>
          {leftIcon && <span className="absolute left-3.5 text-muted-foreground">{leftIcon}</span>}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold placeholder-muted-foreground/60',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              inputClassName,
            )}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 text-muted-foreground">{rightIcon}</span>}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold placeholder-muted-foreground/60',
          className,
          inputClassName,
        )}
        {...props}
      />
    )
  },
)

AppInput.displayName = 'AppInput'

export default AppInput
```

- [ ] **Step 2: Create AppTextarea**

Implement:

```tsx
import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: 'none' | 'vertical'
}

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ className, resize = 'none', ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold placeholder-muted-foreground/60',
        resize === 'none' ? 'resize-none' : 'resize-y',
        className,
      )}
      {...props}
    />
  ),
)

AppTextarea.displayName = 'AppTextarea'

export default AppTextarea
```

- [ ] **Step 3: Migrate form fields page by page**

Replace raw `<input>` and `<textarea>` only where the replacement is one-to-one. Keep special hidden file inputs inside uploaders unchanged.

Start with:

```bash
rg "<input|<textarea" frontend/src/pages/news/components/NewsForm.tsx frontend/src/pages/videos/components/VideoForm.tsx frontend/src/pages/help/components/HelpQuestionForm.tsx frontend/src/pages/site-config/index.tsx -n
```

Expected: visible text/number/email fields move to `AppInput` or `AppTextarea`.

- [ ] **Step 4: Migrate modal forms**

Modify `frontend/src/pages/users/components/UserFormModal.tsx` and `frontend/src/pages/users/components/RoleFormModal.tsx`.

Expected: account, password, nickname, email, role name, role code, description fields use `AppInput` or `AppTextarea`.

- [ ] **Step 5: Migrate login fields**

Modify `frontend/src/pages/login/index.tsx`.

Expected: username and password fields use `AppInput`; password visibility button remains accessible.

- [ ] **Step 6: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/common/AppInput.tsx frontend/src/components/common/AppTextarea.tsx frontend/src/pages/news/components/NewsForm.tsx frontend/src/pages/videos/components/VideoForm.tsx frontend/src/pages/help/components/HelpQuestionForm.tsx frontend/src/pages/site-config/index.tsx frontend/src/pages/users/components/UserFormModal.tsx frontend/src/pages/users/components/RoleFormModal.tsx frontend/src/pages/login/index.tsx
git commit -m "feat: 新增统一输入控件包装组件"
```

## Task 4: Enhance AppButton And Replace Repeated Action Buttons

**Files:**
- Modify: `frontend/src/components/common/AppButton.tsx`
- Modify: `frontend/src/pages/banners/index.tsx`
- Modify: `frontend/src/pages/news/components/NewsList.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionList.tsx`
- Modify: `frontend/src/pages/videos/components/VideoList.tsx`
- Modify: `frontend/src/pages/users/components/UserTab.tsx`
- Modify: `frontend/src/pages/users/components/RoleTab.tsx`
- Modify: `frontend/src/pages/site-config/index.tsx`

- [ ] **Step 1: Extend AppButton variants and sizes**

Add:

```tsx
const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-[10px]',
  default: 'px-5 py-2 text-xs',
  lg: 'px-8 py-3 text-xs',
  icon: 'h-9 w-9 p-0',
  iconSm: 'h-7 w-7 p-0',
} as const
```

Add variants:

```tsx
success: 'bg-emerald-400 text-black border-2 border-border pop-shadow-sm pop-press',
warning: 'bg-amber-400 text-black border-2 border-border pop-shadow-sm pop-press',
```

Ensure `AppButtonProps` includes:

```tsx
size?: keyof typeof SIZE_MAP
```

- [ ] **Step 2: Replace refresh buttons**

Replace repeated refresh icon buttons with:

```tsx
<AppButton type="button" variant="secondary" size="icon" onClick={onRefetch} title="刷新数据">
  <RefreshCw className="h-4 w-4" />
</AppButton>
```

Use page-specific `refetch` callbacks where names differ.

- [ ] **Step 3: Replace edit/delete icon buttons**

Use:

```tsx
<AppButton type="button" variant="secondary" size="iconSm" onClick={...} title="编辑">
  <Edit className="h-3.5 w-3.5" />
</AppButton>

<AppButton type="button" variant="ghost" size="iconSm" onClick={...} title="删除">
  <Trash2 className="h-3.5 w-3.5" />
</AppButton>
```

- [ ] **Step 4: Replace publish/unpublish buttons**

Use:

```tsx
<AppButton type="button" variant={row.is_active ? 'warning' : 'success'} size="sm" onClick={...}>
  {row.is_active ? '下线' : '启用'}
</AppButton>
```

- [ ] **Step 5: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/common/AppButton.tsx frontend/src/pages/banners/index.tsx frontend/src/pages/news/components/NewsList.tsx frontend/src/pages/help/components/HelpQuestionList.tsx frontend/src/pages/videos/components/VideoList.tsx frontend/src/pages/users/components/UserTab.tsx frontend/src/pages/users/components/RoleTab.tsx frontend/src/pages/site-config/index.tsx
git commit -m "feat: 统一页面操作按钮样式"
```

## Task 5: Add AppStatusBadge

**Files:**
- Create: `frontend/src/components/common/AppStatusBadge.tsx`
- Modify: `frontend/src/pages/banners/index.tsx`
- Modify: `frontend/src/pages/news/components/NewsList.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionList.tsx`
- Modify: `frontend/src/pages/contacts/components/ContactList.tsx`
- Modify: `frontend/src/pages/dashboard/index.tsx`
- Modify: `frontend/src/pages/users/components/UserTab.tsx`
- Modify: `frontend/src/pages/videos/components/VideoList.tsx`

- [ ] **Step 1: Create AppStatusBadge**

Implement:

```tsx
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppStatusTone = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info'

const TONE_CLASS: Record<AppStatusTone, string> = {
  default: 'bg-background text-foreground',
  success: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400',
  warning: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400',
  danger: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  muted: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
  info: 'bg-[#E8F4FD] dark:bg-slate-800 text-foreground',
}

interface AppStatusBadgeProps {
  children: ReactNode
  tone?: AppStatusTone
  className?: string
  dot?: boolean
}

export default function AppStatusBadge({
  children,
  tone = 'default',
  className,
  dot = false,
}: AppStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 border-2 border-border text-[10px] font-bold rounded-lg pop-shadow-sm select-none whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-2 w-2 rounded-full', tone === 'success' ? 'bg-emerald-400' : tone === 'warning' ? 'bg-amber-400' : 'bg-muted-foreground/40')} />}
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Replace active/inactive badges**

Use in banners, help questions, videos:

```tsx
<AppStatusBadge tone={row.is_active ? 'success' : 'muted'} dot>
  {row.is_active ? '分发中' : '下线'}
</AppStatusBadge>
```

- [ ] **Step 3: Replace news status badges**

Use:

```tsx
const NEWS_STATUS_BADGE = {
  published: { label: '已发布', tone: 'success' },
  archived: { label: '已归档', tone: 'muted' },
  draft: { label: '草稿', tone: 'warning' },
} as const
```

- [ ] **Step 4: Replace contact status badges**

Use:

```tsx
const CONTACT_STATUS_BADGE = {
  unread: { label: '未读', tone: 'warning' },
  read: { label: '已阅', tone: 'info' },
  processed: { label: '已处理', tone: 'success' },
} as const
```

- [ ] **Step 5: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/common/AppStatusBadge.tsx frontend/src/pages/banners/index.tsx frontend/src/pages/news/components/NewsList.tsx frontend/src/pages/help/components/HelpQuestionList.tsx frontend/src/pages/contacts/components/ContactList.tsx frontend/src/pages/dashboard/index.tsx frontend/src/pages/users/components/UserTab.tsx frontend/src/pages/videos/components/VideoList.tsx
git commit -m "feat: 封装统一状态徽标组件"
```

## Task 6: Add AppToolbar

**Files:**
- Create: `frontend/src/components/common/AppToolbar.tsx`
- Modify: `frontend/src/pages/banners/index.tsx`
- Modify: `frontend/src/pages/news/components/NewsList.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionList.tsx`
- Modify: `frontend/src/pages/videos/components/VideoList.tsx`
- Modify: `frontend/src/pages/users/components/UserTab.tsx`
- Modify: `frontend/src/pages/users/components/RoleTab.tsx`
- Modify: `frontend/src/pages/contacts/components/ContactList.tsx`
- Modify: `frontend/src/pages/site-config/index.tsx`

- [ ] **Step 1: Create AppToolbar**

Implement:

```tsx
import { type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppToolbarProps {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  loading?: boolean
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function AppToolbar({
  icon,
  title,
  subtitle,
  loading = false,
  filters,
  actions,
  className,
}: AppToolbarProps) {
  return (
    <div className={cn('flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300 text-xs', className)}>
      <div className="flex items-center space-x-2.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase truncate">
            {title}
          </h2>
          {subtitle && <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{subtitle}</p>}
        </div>
        {loading && <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" />}
      </div>
      {(filters || actions) && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {filters}
          {actions}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Migrate one simple toolbar first**

Start with `frontend/src/pages/site-config/index.tsx`.

Expected: the top control banner becomes:

```tsx
<AppToolbar
  icon={<Settings className="h-5 w-5 text-primary" />}
  title="站点基本信息配置"
  loading={isLoading || isFetching}
  actions={...}
/>
```

- [ ] **Step 3: Migrate list page toolbars**

Migrate banners, news, help question, videos, users, roles, contacts.

Expected: filters and actions remain page-owned React nodes; `AppToolbar` owns only layout and loading indicator.

- [ ] **Step 4: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/common/AppToolbar.tsx frontend/src/pages/banners/index.tsx frontend/src/pages/news/components/NewsList.tsx frontend/src/pages/help/components/HelpQuestionList.tsx frontend/src/pages/videos/components/VideoList.tsx frontend/src/pages/users/components/UserTab.tsx frontend/src/pages/users/components/RoleTab.tsx frontend/src/pages/contacts/components/ContactList.tsx frontend/src/pages/site-config/index.tsx
git commit -m "feat: 统一页面工具栏布局"
```

## Task 7: Add AppFormShell For Large Edit Pages

**Files:**
- Create: `frontend/src/components/common/AppFormShell.tsx`
- Modify: `frontend/src/pages/news/components/NewsForm.tsx`
- Modify: `frontend/src/pages/videos/components/VideoForm.tsx`
- Modify: `frontend/src/pages/help/components/HelpQuestionForm.tsx`

- [ ] **Step 1: Create AppFormShell**

Implement small layout primitives:

```tsx
import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import AppButton from '@/components/common/AppButton'
import { cn } from '@/lib/utils'

interface AppFormHeaderProps {
  title: ReactNode
  description?: ReactNode
  sticker?: ReactNode
  backTitle?: string
  onBack: () => void
}

export function AppFormHeader({ title, description, sticker, backTitle, onBack }: AppFormHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
      <div className="flex items-center space-x-3 min-w-0">
        <AppButton type="button" variant="secondary" size="icon" onClick={onBack} title={backTitle}>
          <ArrowLeft className="h-4 w-4" />
        </AppButton>
        <div className="min-w-0">
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase truncate">{title}</h2>
          {description && <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{description}</p>}
        </div>
      </div>
      {sticker && (
        <div className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[3deg] hidden sm:inline-block">
          {sticker}
        </div>
      )}
    </div>
  )
}

export function AppFormCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <form className={cn('bg-card border-2 border-border rounded-xl p-8 pop-shadow space-y-6 text-xs', className)}>
      {children}
    </form>
  )
}

export function AppFormMetaPanel({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-6 bg-accent/20 border-2 border-border p-6 rounded-xl pop-shadow-sm h-fit">
      <h3 className="text-xs font-heading font-bold text-foreground border-b-2 border-border pb-3 uppercase tracking-wider select-none">
        {title}
      </h3>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Migrate NewsForm header and metadata panel**

Expected: only structure changes; form state and validation remain in `NewsForm`.

- [ ] **Step 3: Migrate VideoForm header and metadata panel**

Expected: only structure changes; uploaders remain untouched.

- [ ] **Step 4: Migrate HelpQuestionForm header and metadata panel**

Expected: only structure changes; category and editor logic remain untouched.

- [ ] **Step 5: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/common/AppFormShell.tsx frontend/src/pages/news/components/NewsForm.tsx frontend/src/pages/videos/components/VideoForm.tsx frontend/src/pages/help/components/HelpQuestionForm.tsx
git commit -m "feat: 抽象编辑页表单布局组件"
```

## Task 8: Add AppStatsCard, AppTabs, And AppDrawer

**Files:**
- Create: `frontend/src/components/common/AppStatsCard.tsx`
- Create: `frontend/src/components/common/AppTabs.tsx`
- Create: `frontend/src/components/common/AppDrawer.tsx`
- Modify: `frontend/src/pages/dashboard/components/StatCard.tsx`
- Modify: `frontend/src/pages/news/components/NewsStatsCards.tsx`
- Modify: `frontend/src/pages/contacts/components/ContactList.tsx`
- Modify: `frontend/src/pages/users/index.tsx`
- Modify: `frontend/src/pages/contacts/components/ContactDetailDrawer.tsx`

- [ ] **Step 1: Create AppStatsCard**

Move the shared implementation from `frontend/src/pages/dashboard/components/StatCard.tsx` into `frontend/src/components/common/AppStatsCard.tsx`.

Expected props:

```tsx
interface AppStatsCardProps {
  title: string
  value: string | number
  label: string
  bgColorClass?: string
  statusColor?: string
}
```

- [ ] **Step 2: Re-export dashboard StatCard or replace imports**

Preferred: update `frontend/src/pages/dashboard/index.tsx` to import `AppStatsCard` directly and delete the local `StatCard.tsx` only if no longer used.

- [ ] **Step 3: Migrate contacts and news stats**

Replace the local `StatCard` function inside `ContactList.tsx` and the repeated cards in `NewsStatsCards.tsx` with `AppStatsCard`.

- [ ] **Step 4: Create AppTabs**

Wrap `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` from `frontend/src/components/ui/tabs.tsx`.

Expected:

```tsx
interface AppTabsOption<T extends string> {
  value: T
  label: string
}
```

Use it in `frontend/src/pages/users/index.tsx` for `users | roles`.

- [ ] **Step 5: Create AppDrawer**

Wrap `Sheet` primitives from `frontend/src/components/ui/sheet.tsx` with CMS border, header, footer, and right-side sizing. Migrate `ContactDetailDrawer.tsx` to use it without changing process/delete behavior.

- [ ] **Step 6: Verify**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No new lint or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/common/AppStatsCard.tsx frontend/src/components/common/AppTabs.tsx frontend/src/components/common/AppDrawer.tsx frontend/src/pages/dashboard/index.tsx frontend/src/pages/dashboard/components/StatCard.tsx frontend/src/pages/news/components/NewsStatsCards.tsx frontend/src/pages/contacts/components/ContactList.tsx frontend/src/pages/users/index.tsx frontend/src/pages/contacts/components/ContactDetailDrawer.tsx
git commit -m "feat: 补齐统计卡选项卡与抽屉包装组件"
```

## Task 9: Type Safety And Wrapper Cleanup

**Files:**
- Modify: `frontend/src/components/common/AppTable.tsx`
- Modify: `frontend/src/components/business/AppImageUploader.tsx`
- Modify: `frontend/src/components/business/AppVideoUploader.tsx`
- Modify: `frontend/src/pages/news/index.tsx`
- Modify: `frontend/src/pages/help/index.tsx`
- Modify: `frontend/src/pages/videos/index.tsx`
- Modify: `frontend/src/pages/site-config/index.tsx`
- Modify: `frontend/src/pages/users/components/UserFormModal.tsx`
- Modify: `frontend/src/pages/users/components/RoleFormModal.tsx`

- [ ] **Step 1: Remove any from AppTable**

Change column key typing:

```tsx
export interface AppTableColumn<T> {
  title: string
  key: keyof T | string
  render?: (row: T, index: number) => React.ReactNode
  width?: string
  className?: string
}

interface AppTableProps<T extends { id?: string | number }> {
  columns: AppTableColumn<T>[]
  data: T[]
  ...
}
```

Use a safe helper:

```tsx
function getCellValue<T>(row: T, key: keyof T | string) {
  if (typeof key === 'string' && key in Object(row)) {
    return (row as Record<string, unknown>)[key]
  }
  return null
}
```

- [ ] **Step 2: Replace upload error any**

In uploaders, import `getApiErrorMessage` from `frontend/src/lib/api.ts` and replace `err: any` with `err: unknown`.

- [ ] **Step 3: Replace page mutation error any**

Use:

```tsx
onError: (err: unknown) => toast.error(getApiErrorMessage(err, '操作失败'))
```

Apply to news, help, videos, site config.

- [ ] **Step 4: Replace modal payload any**

In `UserFormModal.tsx` and `RoleFormModal.tsx`, define local payload interfaces instead of `const payload: any`.

- [ ] **Step 5: Verify no any remains in target scope**

Run:

```bash
rg "\bany\b" frontend/src/pages frontend/src/components/common frontend/src/components/business -n
```

Expected: no `any` in changed files. If unrelated `any` remains, document it explicitly before stopping.

- [ ] **Step 6: Full verification**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: No lint or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/common/AppTable.tsx frontend/src/components/business/AppImageUploader.tsx frontend/src/components/business/AppVideoUploader.tsx frontend/src/pages/news/index.tsx frontend/src/pages/help/index.tsx frontend/src/pages/videos/index.tsx frontend/src/pages/site-config/index.tsx frontend/src/pages/users/components/UserFormModal.tsx frontend/src/pages/users/components/RoleFormModal.tsx
git commit -m "refactor: 清理前端包装层类型安全问题"
```

## Task 10: Final Audit

**Files:**
- Read: `frontend/src/components/common/`
- Read: `frontend/src/pages/`

- [ ] **Step 1: Search remaining direct shadcn imports in pages**

Run:

```bash
rg "@/components/ui" frontend/src/pages -n
```

Expected: No direct imports unless there is a documented reason.

- [ ] **Step 2: Search raw form controls still worth migrating**

Run:

```bash
rg "<select\b|<input\b|<textarea\b" frontend/src/pages -n
```

Expected: Hidden file inputs, radio inputs, or justified special controls only.

- [ ] **Step 3: Search repeated action button classes**

Run:

```bash
rg "pop-shadow-sm pop-press|border-2 border-border bg-background hover:bg-accent" frontend/src/pages -n
```

Expected: Most action buttons now use `AppButton`; remaining matches are layout-specific and documented.

- [ ] **Step 4: Full frontend verification**

Run:

```bash
cd frontend
pnpm lint
pnpm build
```

Expected: Both commands pass.

- [ ] **Step 5: Produce summary**

Write a short summary covering:

- New `App*` components added.
- Pages migrated.
- Any raw shadcn primitive usage intentionally left in place.
- Verification output.

- [ ] **Step 6: Commit final audit note if docs changed**

```bash
git add docs/superpowers/plans/2026-06-22-frontend-app-wrapper-components.md
git commit -m "docs: 完成前端包装组件计划审计说明"
```

