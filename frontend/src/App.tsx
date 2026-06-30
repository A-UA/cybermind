import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router'
import AdminLayout from '@/components/layout/AdminLayout'
import { AppProtectedRoute } from '@/components/business/AppProtectedRoute'
import AppConfirm from '@/components/common/AppConfirm'
import AppErrorBoundary from '@/components/common/AppErrorBoundary'
import { RefreshCw } from 'lucide-react'

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
      <RefreshCw className="h-6 w-6 text-primary animate-spin" strokeWidth={1.75} />
      <span className="text-[13px] text-muted-foreground">正在加载模块...</span>
    </div>
  )
}

// 403 页面
function ForbiddenPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-background px-4">
      <div className="p-10 bg-card max-w-md w-full text-center rounded-2xl elevation-4 animate-scale-in">
        <h1 className="text-7xl font-heading text-destructive tracking-tight select-all">403</h1>
        <p className="text-sm font-semibold text-foreground mt-6 pb-3 border-b border-border">
          访问请求被拒绝
        </p>
        <p className="text-[13px] text-muted-foreground mt-4 leading-relaxed max-w-xs mx-auto">
          您的账号未获得此页面的访问权限。请联系系统管理员获取授权。
        </p>
        <Link
          to="/"
          className="mt-8 inline-block w-full py-2.5 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 elevation-1 transition-all"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}

// 404 页面
function NotFoundPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-background px-4">
      <div className="p-10 bg-card max-w-md w-full text-center rounded-2xl elevation-4 animate-scale-in">
        <h1 className="text-7xl font-heading text-primary tracking-tight select-all">404</h1>
        <p className="text-sm font-semibold text-foreground mt-6 pb-3 border-b border-border">
          页面不存在
        </p>
        <p className="text-[13px] text-muted-foreground mt-4 leading-relaxed max-w-xs mx-auto">
          请求的页面地址不存在。请检查 URL 拼写，或点击下方按钮返回首页。
        </p>
        <Link
          to="/"
          className="mt-8 inline-block w-full py-2.5 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 elevation-1 transition-all"
        >
          返回首页
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
