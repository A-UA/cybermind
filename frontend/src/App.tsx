import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router'
import AdminLayout from '@/components/layout/AdminLayout'
import { AppProtectedRoute } from '@/components/business/AppProtectedRoute'
import AppConfirm from '@/components/common/AppConfirm'
import AppErrorBoundary from '@/components/common/AppErrorBoundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// 路由懒加载
const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const BannersPage = lazy(() => import('@/pages/banners'))
const SiteConfigPage = lazy(() => import('@/pages/site-config'))
const NewsPage = lazy(() => import('@/pages/news'))
const HelpPage = lazy(() => import('@/pages/help'))
const VideosPage = lazy(() => import('@/pages/videos'))
const ContactsPage = lazy(() => import('@/pages/contacts'))
const UsersPage = lazy(() => import('@/pages/users'))

// 页面加载骨架屏
function PageLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-64 space-y-3">
      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      <span className="text-xs text-muted-foreground font-semibold">正在加载模块...</span>
    </div>
  )
}

// 403 页面 (高亮波普警告风格)
function ForbiddenPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center pop-brutal-bg px-4">
      <div className="p-10 bg-card border-2 border-border max-w-md w-full text-center rounded-xl pop-shadow-lg">
        <div className="w-16 h-16 bg-destructive/10 border-2 border-border rounded-lg flex items-center justify-center mx-auto mb-6 pop-shadow-sm">
          <AlertTriangle className="h-7 w-7 text-destructive animate-pulse" />
        </div>
        <h1 className="text-8xl font-heading font-black text-destructive tracking-tighter select-all">403</h1>
        <p className="text-sm tracking-widest uppercase font-bold text-foreground mt-6 border-b-2 border-border pb-3">
          访问请求被拒绝 // ACCESS RESTRICTED
        </p>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-xs mx-auto font-semibold">
          您的安全凭证中未包含此控制模块所需的权限令牌。请联系系统管理员获取授权。
        </p>
        <Link to="/" className="mt-8 inline-block w-full py-2.5 px-6 rounded-lg bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider uppercase pop-shadow-sm pop-press">
          返回控制台首页 BACK TO INDEX
        </Link>
      </div>
    </div>
  )
}

// 404 页面
function NotFoundPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center pop-brutal-bg px-4">
      <div className="p-10 bg-card border-2 border-border max-w-md w-full text-center rounded-xl pop-shadow-lg">
        <h1 className="text-8xl font-heading font-black text-primary tracking-tighter select-all">404</h1>
        <p className="text-sm tracking-widest uppercase font-bold text-foreground mt-6 border-b-2 border-border pb-3">
          链路寻找失败 // PAGE NOT FOUND
        </p>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-xs mx-auto font-semibold">
          请求的通信链路（页面 URL）不存在。请检查拼写，或点击下方按钮返回系统首页。
        </p>
        <Link to="/" className="mt-8 inline-block w-full py-2.5 px-6 rounded-lg bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider uppercase pop-shadow-sm pop-press">
          返回控制台首页 BACK TO INDEX
        </Link>
      </div>
    </div>
  )
}

function AuthLogoutListener() {
  const navigate = useNavigate()
  useEffect(() => {
    const handleLogout = () => navigate('/login', { replace: true })
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate])
  return null
}

export default function App() {
  return (
    <AppErrorBoundary>
    <Suspense fallback={<PageLoading />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* 必须登录的受保护路由 */}
      <Route element={<AppProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* 带权限控制的路由 */}
          <Route element={<AppProtectedRoute permission="banner:read" />}>
            <Route path="/banners" element={<BannersPage />} />
          </Route>

          <Route element={<AppProtectedRoute permission="news:read" />}>
            <Route path="/news" element={<NewsPage />} />
          </Route>

          <Route element={<AppProtectedRoute permission="help:read" />}>
            <Route path="/help" element={<HelpPage />} />
          </Route>

          <Route element={<AppProtectedRoute permission="video:read" />}>
            <Route path="/videos" element={<VideosPage />} />
          </Route>

          <Route element={<AppProtectedRoute permission="contact:read" />}>
            <Route path="/contacts" element={<ContactsPage />} />
          </Route>

          <Route element={<AppProtectedRoute permission="user:read" />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<AppProtectedRoute permission="config:read" />}>
            <Route path="/config" element={<SiteConfigPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
    <AuthLogoutListener />
    <AppConfirm />
    </AppErrorBoundary>
  )
}
