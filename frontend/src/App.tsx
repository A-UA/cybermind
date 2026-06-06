import { Routes, Route, Link as RouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import LoginPage from '@/pages/login'
import BannersPage from '@/pages/banners'
import SiteConfigPage from '@/pages/site-config'
import NewsPage from '@/pages/news'
import HelpPage from '@/pages/help'
import VideosPage from '@/pages/videos'
import ContactsPage from '@/pages/contacts'
import UsersPage from '@/pages/users'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Terminal, Cpu, Database, Server, AlertTriangle, ShieldCheck } from 'lucide-react'

// 局部的优雅 Link 封装
function Link({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  return <RouterLink to={to} className={className}>{children}</RouterLink>
}

// 雅致指标卡片组件 (新野兽派撞色拼贴)
function StatCard({ 
  title, 
  value, 
  label, 
  bgColorClass = 'bg-card',
  statusColor = 'bg-primary' 
}: { 
  title: string; 
  value: string; 
  label: string; 
  bgColorClass?: string;
  statusColor?: string 
}) {
  return (
    <div className={`p-6 ${bgColorClass} border-2 border-border rounded-xl pop-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)] transition-all duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between text-[11px] text-foreground font-heading tracking-wider uppercase font-bold">
        <span>{title}</span>
        <span className={`w-3 h-3 rounded-full border-2 border-border ${statusColor}`} />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-4xl font-heading font-bold tracking-tight text-foreground select-all">{value}</span>
        <span className="text-[10px] text-muted-foreground font-semibold tracking-wider font-mono">{label}</span>
      </div>
    </div>
  )
}

// 看板/首页 页面
function DashboardPage() {
  const { data, isLoading } = useQuery<{ today_uv: number; total_pv: number }>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/tracking/stats')
      return res.data.data
    }
  })

  const todayUv = data?.today_uv ?? 0
  const totalPv = data?.total_pv ?? 0

  return (
    <div className="space-y-8 text-foreground font-sans">
      {/* 顶部三页实体撞色拼贴卡纸 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="今日 IP 访问数 // CLIENT_NET_IPS"
          value={isLoading ? '...' : todayUv.toLocaleString()}
          label="请求次数 / 24H"
          bgColorClass="bg-[#E8F4FD] dark:bg-[#1E293B]"
          statusColor="bg-primary"
        />
        <StatCard 
          title="全站总浏览量 // NET_TOTAL_VIEWS"
          value={isLoading ? '...' : totalPv.toLocaleString()}
          label="累计访问量"
          bgColorClass="bg-[#FEF9E7] dark:bg-[#1E293B]"
          statusColor="bg-primary"
        />
        <StatCard 
          title="容器运行状态 // RUNTIME_CONTAINER"
          value="DOCKER_VM"
          label="运行状态 [100%]"
          bgColorClass="bg-[#E8F8F5] dark:bg-[#1E293B]"
          statusColor="bg-emerald-400"
        />
      </div>

      {/* 运营控制台新野兽派日志面板 */}
      <div className="bg-card border-2 border-border rounded-xl p-8 pop-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-border pb-5 mb-6">
          <div>
            <h3 className="text-2xl font-heading font-bold text-foreground flex items-center space-x-2.5">
              <Terminal className="h-5 w-5 text-primary" />
              <span>系统运行日志 // JOURNAL</span>
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-1">记录系统初始化与最新节点安全装载过程</p>
          </div>
          {/* 贴纸 */}
          <span className="px-2.5 py-1 text-[9px] font-heading font-bold border-2 border-border bg-accent text-foreground rounded-lg pop-shadow-sm rotate-[2deg] mt-3 md:mt-0 max-w-fit">
            SECURE_NODE_ALPHA_12
          </span>
        </div>
        
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-start p-3 bg-background border-2 border-border rounded-lg pop-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#E8F4FD] dark:bg-slate-700 border-2 border-border flex items-center justify-center flex-shrink-0 mr-3 text-foreground">
              <Server className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-bold">[系统初始化] 载入系统核心配置</p>
              <p className="text-muted-foreground mt-0.5 font-semibold">读取环境变量及 JWT 安全密钥，完成系统级上下文载入。</p>
            </div>
            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border-2 border-emerald-500/20 px-2 py-0.5 rounded-lg select-none">成功</span>
          </div>

          <div className="flex items-start p-3 bg-background border-2 border-border rounded-lg pop-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#FEF9E7] dark:bg-slate-700 border-2 border-border flex items-center justify-center flex-shrink-0 mr-3 text-foreground">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-bold">[数据库连接] 建立 MySQL 数据库连接池</p>
              <p className="text-muted-foreground mt-0.5 font-semibold">多路复用连接池建立就绪，支持事务隔离级别读已提交。</p>
            </div>
            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border-2 border-emerald-500/20 px-2 py-0.5 rounded-lg select-none">成功</span>
          </div>

          <div className="flex items-start p-3 bg-background border-2 border-border rounded-lg pop-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#F5EEF8] dark:bg-slate-700 border-2 border-border flex items-center justify-center flex-shrink-0 mr-3 text-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-bold">[安全服务组件] 初始化令牌拦截器 & 注入 RBAC 策略依赖</p>
              <p className="text-muted-foreground mt-0.5 font-semibold">系统内置预设权限字典载入完毕，支持以 Depends 粒度进行路由级拦截。</p>
            </div>
            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border-2 border-emerald-500/20 px-2 py-0.5 rounded-lg select-none">成功</span>
          </div>

          <div className="flex items-start p-3 bg-background border-2 border-border rounded-lg pop-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            <div className="w-8 h-8 rounded-lg bg-accent border-2 border-border flex items-center justify-center flex-shrink-0 mr-3 text-foreground">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-bold">[存储驱动初始化] 静态文件存储后端指向: 本地磁盘存储</p>
              <p className="text-muted-foreground mt-0.5 font-semibold">基于 StorageBackend 抽象类实现，上传路径已成功映射并准备就绪。</p>
            </div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider bg-muted border-2 border-border/40 px-2 py-0.5 rounded-lg select-none">就绪</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between text-xs text-muted-foreground bg-accent/30 p-4 rounded-lg border-2 border-border font-semibold">
          <span>全站底层驱动程序搭建就绪，您可以通过左侧画廊导航栏优雅操控业务板块。</span>
          <span className="text-primary mt-2 md:mt-0 font-bold tracking-wider uppercase font-mono">WORKSPACE READY // 就绪</span>
        </div>
      </div>
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
            <Route path="/news" element={<NewsPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="help:read" />}>
            <Route path="/help" element={<HelpPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="video:read" />}>
            <Route path="/videos" element={<VideosPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="contact:read" />}>
            <Route path="/contacts" element={<ContactsPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="user:read" />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="config:read" />}>
            <Route path="/config" element={<SiteConfigPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
