# 前端代码隐患修复进度

> 生成时间: 2026-06-21
> 最后更新: 2026-06-21
> 分支: main

---

## 全部完成 ✅

### P0: #1 — Auth 存储从 localStorage 切换到 sessionStorage ✅

**文件**: `src/stores/auth.ts`

自定义 storage 适配器，使用 sessionStorage（标签页关闭即清除），防止 XSS 窃取 accessToken 明文。

---

### P0: #4a-g — 重写全部 Query Hooks，对齐页面 queryKey ✅
### P0: #4h-n — 重构全部 7 个页面使用 Query Hooks（含 Banners） ✅

**文件** (7个):
- `src/queries/useBannerQuery.ts` — 已对齐
- `src/queries/useNewsQuery.ts` — queryKey 改为 `[news, page, title, status, category]`
- `src/queries/useContactQuery.ts` — 重写：拆分 countUnread/countRead/countProcessed；`useContactDetail` 从 mutation 改为 `useQuery(enabled)` 模式
- `src/queries/useUserQuery.ts` — 新增 roleKeys、useRoleList、usePermissionList、useCreateRole、useUpdateRole、useDeleteRole、useAssignRoles、useAssignPermissions
- `src/queries/useVideoQuery.ts` — 新增 useSaveVideo、useIncrementVideoView
- `src/queries/useHelpQuery.ts` — queryKey 对齐页面，重命名函数更语义化
- `src/queries/useSiteConfigQuery.ts` — 修复类型引用（IUser → ISiteConfigItem）

---

### P0: #4h-n — 重构全部 7 个页面使用 Query Hooks ✅

**文件**:
- `src/pages/banners/index.tsx` — 移除内联 useQuery/useMutation，改用 useBannerList/useDeleteBanner
- `src/pages/news/index.tsx` — 移除全部内联 useQuery/useMutation，改用 7 个 hooks
- `src/pages/contacts/index.tsx` — 移除 3 个内联 count 查询 + 列表查询 + detail mutation
- `src/pages/users/index.tsx` — 移除 6 个内联查询 + 6 个内联 mutation
- `src/pages/videos/index.tsx` — 移除内联查询 + 4 个 mutation
- `src/pages/help/index.tsx` — 移除 2 个内联查询 + 5 个 mutation
- `src/pages/site-config/index.tsx` — 移除内联查询 + 内联类型定义 + mutation

**额外修复**: 所有页面的 `onRefetch={() => {}}` 空函数已替换为实际的 `refetch()` 调用，刷新按钮恢复工作。

---

### P1: #14 — 路由懒加载 ✅

**文件**: `src/App.tsx`

8 个页面全部改为 `React.lazy()` 动态 import，配合 `<Suspense>` 骨架屏。Build 验证通过，每个页面拆为独立 chunk。

---

### P1: #17 — ErrorBoundary ✅

**文件**: `src/components/common/AppErrorBoundary.tsx`（新建）

Class component 捕获渲染异常，展示错误信息 + 重试/重新加载按钮。在 App 最外层包裹。

---

### P2: #10 — QueryClient retry 策略 ✅

**文件**: `src/main.tsx`

从 `retry: false` 改为 `retry: (failureCount, error) => error.response?.status >= 500 && failureCount < 1`，仅对 5xx 服务端错误重试 1 次。

---

### P2: #11 — AppRichEditor 光标跳动 ✅

**文件**: `src/components/common/AppRichEditor.tsx`

增加 `editor.isFocused` 判断，仅在编辑器非聚焦状态下同步外部 value，避免光标跳到末尾。

---

### P2: #12 — AppTable 用 index 做 key ✅

**文件**: `src/components/common/AppTable.tsx`

从 `key={rowIndex}` 改为 `key={(row as any)?.id ?? rowIndex}`，优先使用数据行 id。

---

### P3: #7 — Dashboard 假状态面板 ✅

**文件**: `src/pages/dashboard/index.tsx`

移除永远显示 ACTIVE/ONLINE 的假"控制台状态"区块及 `Terminal` import。

---

### P3: #3 — Token 刷新失败跳转方式 ✅

**文件**: `src/lib/api.ts` + `src/App.tsx`

将 `window.location.href = '/login'` 改为自定义事件 `auth:logout`，App.tsx 中用 `useNavigate` 监听并执行 react-router 跳转，避免全页刷新丢失状态。

---

### P3: #13 — AppVideoUploader 时长提取竞态 ✅

**文件**: `src/components/business/AppVideoUploader.tsx`

将 `onloadedmetadata` 回调包装为 `Promise`，`await` 时长提取完成后再发起上传请求，消除竞态。

---

## 统计

| 优先级 | 总数 | 已完成 |
|--------|------|--------|
| P0 | 8 | 8 ✅ |
| P1 | 2 | 2 ✅ |
| P2 | 4 | 4 ✅ |
| P3 | 3 | 3 ✅ |
| **合计** | **18** | **18 ✅** |

## 额外修复

- 所有页面的 `onRefetch={() => {}}` 空函数已替换为实际的 `refetch()` 调用，刷新按钮恢复工作

## 验证

- `tsc --noEmit`: ✅ 零错误（仅 tsconfig.json 的 baseUrl 弃用警告，为既有配置问题）
- `vite build`: ✅ 构建成功，页面 chunk 已正确拆分
