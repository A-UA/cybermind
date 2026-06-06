import { Routes, Route, Navigate } from 'react-router'
import LoginPage from '@/pages/login'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// 看板/首页 占位页面
function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400">今日访问次数 (IP)</h3>
          <p className="text-3xl font-extrabold text-blue-400 mt-2">1,248</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400">累计总浏览量</h3>
          <p className="text-3xl font-extrabold text-indigo-400 mt-2">45,892</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400">运行环境状态</h3>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">Docker</p>
        </div>
      </div>
      <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col justify-center items-center text-center">
        <h3 className="text-xl font-bold text-slate-200">欢迎来到 CyberMind CMS 管理后台</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-lg">
          这是系统基础设施，您可以在侧边栏查看已经分配并注入好权限验证的模块。后续模块开发将在此框架中无缝进行。
        </p>
      </div>
    </div>
  )
}

// 通用占位页面组件
function ModulePlaceholderPage({ title }: { title: string }) {
  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col justify-center items-center text-center">
      <div className="p-10 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md max-w-md shadow-xl">
        <h3 className="text-2xl font-bold text-slate-200">{title}</h3>
        <p className="text-slate-400 text-sm mt-3">
          该模块已经完成了数据库设计、后端权限依赖和 API 路由的接入。
        </p>
        <div className="mt-6 inline-flex px-3 py-1 text-xs font-semibold rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
          阶段一：基础设施已就绪
        </div>
      </div>
    </div>
  )
}

// 403 页面
function ForbiddenPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-slate-950 text-slate-100">
      <h1 className="text-6xl font-black text-red-500">403</h1>
      <p className="text-xl font-semibold text-slate-300 mt-4">抱歉，您没有访问此页面的权限</p>
      <Link to="/" className="mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all">
        返回首页
      </Link>
    </div>
  )
}

import { Link as RouterLink } from 'react-router'
function Link({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  return <RouterLink to={to} className={className}>{children}</RouterLink>
}

// 404 页面
function NotFoundPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-slate-950 text-slate-100">
      <h1 className="text-6xl font-black text-slate-400">404</h1>
      <p className="text-xl font-semibold text-slate-300 mt-4">页面未找到</p>
      <Link to="/" className="mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all">
        返回首页
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* 必须登录的受保护路由 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* 带权限控制的路由 */}
          <Route element={<ProtectedRoute permission="banner:read" />}>
            <Route path="/banners" element={<ModulePlaceholderPage title="Banner 图片上传与管理" />} />
          </Route>

          <Route element={<ProtectedRoute permission="news:read" />}>
            <Route path="/news" element={<ModulePlaceholderPage title="新闻资讯与浏览量统计" />} />
          </Route>

          <Route element={<ProtectedRoute permission="help:read" />}>
            <Route path="/help" element={<ModulePlaceholderPage title="帮助中心常见问题管理" />} />
          </Route>

          <Route element={<ProtectedRoute permission="video:read" />}>
            <Route path="/videos" element={<ModulePlaceholderPage title="操作视频管理与上传" />} />
          </Route>

          <Route element={<ProtectedRoute permission="contact:read" />}>
            <Route path="/contacts" element={<ModulePlaceholderPage title="用户联系我们表单管理" />} />
          </Route>

          <Route element={<ProtectedRoute permission="user:read" />}>
            <Route path="/users" element={<ModulePlaceholderPage title="管理员与 RBAC 权限管理" />} />
          </Route>

          <Route element={<ProtectedRoute permission="config:read" />}>
            <Route path="/config" element={<ModulePlaceholderPage title="系统站点配置中心" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
