import { Routes, Route, Link } from 'react-router'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import BannersPage from '@/pages/banners'
import SiteConfigPage from '@/pages/site-config'
import NewsPage from '@/pages/news'
import HelpPage from '@/pages/help'
import VideosPage from '@/pages/videos'
import ContactsPage from '@/pages/contacts'
import UsersPage from '@/pages/users'
import AdminLayout from '@/components/layout/AdminLayout'
import { AppProtectedRoute } from '@/components/business/AppProtectedRoute'
import AppConfirm from '@/components/common/AppConfirm'
import { AlertTriangle } from 'lucide-react'

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

export default function App() {
  return (
    <>
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
    <AppConfirm />
    </>
  )
}
