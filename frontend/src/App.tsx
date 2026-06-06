import { Routes, Route, Link as RouterLink } from 'react-router'
import LoginPage from '@/pages/login'
import BannersPage from '@/pages/banners'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Terminal, Cpu, Database, Server, Compass, AlertTriangle, ShieldCheck } from 'lucide-react'

// 局部的优雅 Link 封装
function Link({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  return <RouterLink to={to} className={className}>{children}</RouterLink>
}

// 雅致指标卡片组件
function StatCard({ title, value, label, statusColor = 'bg-primary' }: { title: string; value: string; label: string; statusColor?: string }) {
  return (
    <div className="p-6 bg-card border border-border/50 rounded-xl elegant-shadow hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans tracking-widest uppercase font-semibold">
        <span>{title}</span>
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-4xl font-heading font-light tracking-tight text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground/80 font-sans tracking-wider">{label}</span>
      </div>
    </div>
  )
}

// 看板/首页 页面
function DashboardPage() {
  return (
    <div className="space-y-8 text-foreground">
      {/* 顶部三栏系统核心参数 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="今日 IP 访问数 // CLIENT_NET_IPS"
          value="1,248"
          label="请求次数 / 24H"
          statusColor="bg-primary/80"
        />
        <StatCard 
          title="全站总浏览量 // NET_TOTAL_VIEWS"
          value="45,892"
          label="累计访问量"
          statusColor="bg-primary/80"
        />
        <StatCard 
          title="容器运行状态 // RUNTIME_CONTAINER"
          value="Docker VM"
          label="活跃运行 [100%]"
          statusColor="bg-emerald-500/80"
        />
      </div>

      {/* 运营控制台雅致日志画卷 */}
      <div className="bg-card border border-border/50 rounded-xl p-8 elegant-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-5 mb-6">
          <div>
            <h3 className="text-xl font-heading font-light text-foreground flex items-center space-x-2.5">
              <Terminal className="h-4 w-4 text-primary/70" />
              <span>系统运行日志 // System Status Journal</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">记录系统初始化与最新节点安全装载过程</p>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono mt-2 md:mt-0 tracking-wider">
            安全校验节点: SECURE_NODE_ALPHA_12
          </span>
        </div>
        
        <div className="space-y-4 font-sans text-sm">
          <div className="flex items-start p-3 hover:bg-muted/30 rounded-lg transition-colors border-b border-border/20 last:border-0 pb-3">
            <Server className="h-4 w-4 mr-3 text-primary/70 mt-0.5" />
            <div className="flex-1">
              <p className="text-foreground/80 font-medium">[系统初始化] 载入系统核心配置</p>
              <p className="text-xs text-muted-foreground mt-0.5">读取环境变量及 JWT 安全密钥，完成系统级上下文载入。</p>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">成功</span>
          </div>

          <div className="flex items-start p-3 hover:bg-muted/30 rounded-lg transition-colors border-b border-border/20 last:border-0 pb-3">
            <Database className="h-4 w-4 mr-3 text-primary/70 mt-0.5" />
            <div className="flex-1">
              <p className="text-foreground/80 font-medium">[数据库连接] 建立 MySQL 数据库连接池</p>
              <p className="text-xs text-muted-foreground mt-0.5">多路复用连接池建立就绪，支持事务隔离级别读已提交。</p>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">成功</span>
          </div>

          <div className="flex items-start p-3 hover:bg-muted/30 rounded-lg transition-colors border-b border-border/20 last:border-0 pb-3">
            <ShieldCheck className="h-4 w-4 mr-3 text-primary/70 mt-0.5" />
            <div className="flex-1">
              <p className="text-foreground/80 font-medium">[安全服务组件] 初始化令牌拦截器 & 注入 RBAC 策略依赖</p>
              <p className="text-xs text-muted-foreground mt-0.5">系统内置预设权限字典载入完毕，支持以 Depends 粒度进行路由级拦截。</p>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">成功</span>
          </div>

          <div className="flex items-start p-3 hover:bg-muted/30 rounded-lg transition-colors border-b border-border/20 last:border-0 pb-3">
            <Cpu className="h-4 w-4 mr-3 text-muted-foreground/60 mt-0.5" />
            <div className="flex-1">
              <p className="text-foreground/75 font-medium">[存储驱动初始化] 静态文件存储后端指向: 本地磁盘存储</p>
              <p className="text-xs text-muted-foreground mt-0.5">基于 StorageBackend 抽象类实现，上传路径已成功映射并准备就绪。</p>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">就绪</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between text-xs text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border/30">
          <span>全站底层驱动程序搭建就绪，您可以通过左侧画廊导航栏优雅操控业务板块。</span>
          <span className="text-primary mt-2 md:mt-0 font-semibold tracking-wider uppercase">系统工作台就绪 // WORKSPACE READY</span>
        </div>
      </div>
    </div>
  )
}

// 通用占位页面组件 (艺术空状态)
function ModulePlaceholderPage({ title }: { title: string }) {
  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col justify-center items-center text-center">
      <div className="p-10 bg-card border border-border/50 max-w-lg rounded-2xl elegant-shadow text-center">
        <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass className="h-6 w-6 text-primary/70 animate-spin-slow" />
        </div>
        <h3 className="text-2xl font-heading font-light text-foreground tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-sm mx-auto">
          该核心业务模块的数据库模型、Alembic 迁移脚本、后端 Service 事务处理以及 API 权限验证路由已在底层装配完毕。
        </p>
        <div className="mt-8 inline-flex items-center px-4 py-1.5 text-xs tracking-wider font-semibold text-primary bg-primary/5 border border-primary/10 rounded-full">
          阶段二：等待模块激活 (AWAITING SERVICE ACTIVATION)
        </div>
      </div>
    </div>
  )
}

// 403 页面 (高雅红暗极简风格)
function ForbiddenPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center elegant-gradient-bg px-4">
      <div className="p-10 bg-card border border-border/50 max-w-md w-full text-center rounded-2xl elegant-shadow">
        <div className="w-16 h-16 bg-destructive/5 border border-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-6 w-6 text-destructive/80 animate-pulse" />
        </div>
        <h1 className="text-8xl font-heading font-light text-destructive/80 tracking-tighter">403</h1>
        <p className="text-sm tracking-widest uppercase font-semibold text-foreground/80 mt-6">
          访问请求被拒绝 // ACCESS RESTRICTED
        </p>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-xs mx-auto">
          您的安全凭证中未包含此控制模块所需的权限令牌。请联系系统管理员获取授权。
        </p>
        <Link to="/" className="mt-8 inline-block w-full py-2.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 hover:-translate-y-0.5 transition-all text-xs font-semibold tracking-widest uppercase elegant-shadow">
          返回控制台首页
        </Link>
      </div>
    </div>
  )
}

// 404 页面
function NotFoundPage() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center elegant-gradient-bg px-4">
      <div className="p-10 bg-card border border-border/50 max-w-md w-full text-center rounded-2xl elegant-shadow">
        <h1 className="text-8xl font-heading font-light text-primary/80 tracking-tighter">404</h1>
        <p className="text-sm tracking-widest uppercase font-semibold text-foreground/80 mt-6">
          链路寻找失败 // PAGE NOT FOUND
        </p>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-xs mx-auto">
          请求的通信链路（页面 URL）不存在。请检查拼写，或点击下方按钮返回系统首页。
        </p>
        <Link to="/" className="mt-8 inline-block w-full py-2.5 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 hover:-translate-y-0.5 transition-all text-xs font-semibold tracking-widest uppercase elegant-shadow">
          返回控制台首页
        </Link>
      </div>
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
            <Route path="/banners" element={<BannersPage />} />
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
