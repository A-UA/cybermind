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
import { AppProtectedRoute } from '@/components/business/AppProtectedRoute'
import AppConfirm from '@/components/common/AppConfirm'
import { 
  Terminal, AlertTriangle, RefreshCw,
  TrendingUp, Eye, BookOpen, MessageSquare, Clock, ArrowRight, Activity 
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

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

// 趋势流量折线图组件
function TrendChart({ data }: { data: any[] }) {
  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'currentColor', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
          />
          <YAxis 
            tick={{ fill: 'currentColor', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
            tickLine={{ stroke: 'var(--border)', strokeWidth: 2 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--border)', 
              borderWidth: 2, 
              borderRadius: 8,
              fontSize: 11
            }} 
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
          <Line 
            type="monotone" 
            dataKey="pv" 
            name="全站总浏览量 (PV)" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--border)' }} 
          />
          <Line 
            type="monotone" 
            dataKey="uv" 
            name="独立IP数 (UV)" 
            stroke="#10b981" 
            strokeWidth={3} 
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--border)' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// 看板/首页 页面
function DashboardPage() {
  // 1. 获取总览指标
  const { data: overview, isLoading: isOverviewLoading } = useQuery<{
    total_pv: number
    today_uv: number
    news_count: number
    pending_contact_count: number
  }>({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/stats/overview')
      return res.data.data
    }
  })

  // 2. 获取趋势折线图
  const { data: trendData = [], isLoading: isTrendLoading } = useQuery<any[]>({
    queryKey: ['dashboard-trend'],
    queryFn: async () => {
      const res = await apiClient.get('/stats/trend?days=7')
      return res.data.data
    }
  })

  // 3. 获取热门页面排行
  const { data: topPages = [], isLoading: isTopPagesLoading } = useQuery<any[]>({
    queryKey: ['dashboard-top-pages'],
    queryFn: async () => {
      const res = await apiClient.get('/stats/top-pages?limit=5')
      return res.data.data
    }
  })

  // 4. 获取最新文章
  const { data: recentNews = [] } = useQuery<any[]>({
    queryKey: ['dashboard-recent-news'],
    queryFn: async () => {
      const res = await apiClient.get('/news', { params: { page: 1, page_size: 5 } })
      return res.data.data.items
    }
  })

  // 5. 获取最新客户留言
  const { data: recentContacts = [] } = useQuery<any[]>({
    queryKey: ['dashboard-recent-contacts'],
    queryFn: async () => {
      const res = await apiClient.get('/contact-submissions', { params: { page: 1, page_size: 5 } })
      return res.data.data.items
    }
  })

  const todayUv = overview?.today_uv ?? 0
  const totalPv = overview?.total_pv ?? 0
  const newsCount = overview?.news_count ?? 0
  const pendingContactCount = overview?.pending_contact_count ?? 0

  return (
    <div className="space-y-8 text-foreground font-sans pb-8">
      {/* 顶部四个维度的实体撞色拼贴卡纸 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="今日 IP 访问数 // CLIENT_NET_IPS"
          value={isOverviewLoading ? '...' : todayUv.toLocaleString()}
          label="请求次数 / 24H"
          bgColorClass="bg-[#E8F4FD] dark:bg-[#1E293B]"
          statusColor="bg-primary"
        />
        <StatCard 
          title="全站总访问量 // NET_TOTAL_VIEWS"
          value={isOverviewLoading ? '...' : totalPv.toLocaleString()}
          label="累计访问量"
          bgColorClass="bg-[#FEF9E7] dark:bg-[#1E293B]"
          statusColor="bg-primary"
        />
        <StatCard 
          title="发布文章总数 // NEWS_ARTICLES"
          value={isOverviewLoading ? '...' : newsCount.toString()}
          label="篇已发布新闻"
          bgColorClass="bg-[#F5EEF8] dark:bg-[#1E293B]"
          statusColor="bg-purple-400"
        />
        <StatCard 
          title="待处理留言 // PENDING_FEEDBACK"
          value={isOverviewLoading ? '...' : pendingContactCount.toString()}
          label="条客户建议未回复"
          bgColorClass="bg-[#E8F8F5] dark:bg-[#1E293B]"
          statusColor={pendingContactCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧主要区域 (趋势图 + 排行榜) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 折线趋势图 */}
          <div className="bg-card border-2 border-border rounded-xl p-6 pop-shadow">
            <h3 className="text-sm font-heading font-bold text-foreground flex items-center space-x-2 border-b-2 border-border pb-3 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>近 7 天访问趋势流量统计 // TRAFFIC_FLOW</span>
            </h3>
            {isTrendLoading ? (
              <div className="h-80 flex justify-center items-center text-xs text-muted-foreground font-semibold">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                正在加载统计数据...
              </div>
            ) : (
              <TrendChart data={trendData} />
            )}
          </div>

          {/* 热门访问页面排行 */}
          <div className="bg-card border-2 border-border rounded-xl p-6 pop-shadow">
            <h3 className="text-sm font-heading font-bold text-foreground flex items-center space-x-2 border-b-2 border-border pb-3 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <span>前台热门内容排行 // TOP_PAGES</span>
            </h3>
            {isTopPagesLoading ? (
              <div className="h-48 flex justify-center items-center text-xs text-muted-foreground font-semibold">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                正在分析访问日志...
              </div>
            ) : topPages.length === 0 ? (
              <div className="h-48 flex justify-center items-center text-xs text-muted-foreground font-semibold">
                暂无访问事件数据
              </div>
            ) : (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={page.page_path} className="flex items-center justify-between p-3 bg-background border-2 border-border rounded-lg pop-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border-2 border-border ${
                        index === 0 ? 'bg-[#FEF9E7] text-black' : index === 1 ? 'bg-[#E8F4FD] text-black' : 'bg-accent text-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-xs font-mono truncate font-bold text-foreground select-all" title={page.page_path}>
                        {page.page_path}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-muted-foreground whitespace-nowrap ml-3">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{page.views} 次访问</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧边栏区域 (最新消息 + 留言) */}
        <div className="space-y-8">
          {/* 最新发布文章 */}
          <div className="bg-card border-2 border-border rounded-xl p-6 pop-shadow">
            <h4 className="text-xs font-heading font-bold text-foreground flex items-center justify-between border-b-2 border-border pb-3 mb-4">
              <span className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>最新发布资讯 // EDITORIAL</span>
              </span>
              <Link to="/news" className="text-[10px] text-primary hover:underline flex items-center space-x-1 font-bold">
                <span>进入管理</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </h4>
            {recentNews.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground font-semibold">暂无已发布文章</div>
            ) : (
              <div className="space-y-3">
                {recentNews.map((n: any) => (
                  <div key={n.id} className="p-3 bg-background border-2 border-border rounded-lg hover:bg-accent/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-foreground line-clamp-1 flex-1">{n.title}</span>
                      <span className="px-1.5 py-0.5 border border-border bg-accent text-[9px] font-bold rounded text-muted-foreground whitespace-nowrap">
                        {n.category || '未分类'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{n.view_count} 阅读</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 最新留言 */}
          <div className="bg-card border-2 border-border rounded-xl p-6 pop-shadow">
            <h4 className="text-xs font-heading font-bold text-foreground flex items-center justify-between border-b-2 border-border pb-3 mb-4">
              <span className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>最新客户留言 // FEEDBACK</span>
              </span>
              <Link to="/contacts" className="text-[10px] text-primary hover:underline flex items-center space-x-1 font-bold">
                <span>处理留言</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </h4>
            {recentContacts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground font-semibold">暂无留言提交记录</div>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((c: any) => (
                  <div key={c.id} className="p-3 bg-background border-2 border-border rounded-lg hover:bg-accent/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-foreground line-clamp-1 flex-1">{c.subject}</span>
                      <span className={`px-1.5 py-0.5 border text-[9px] font-bold rounded whitespace-nowrap ${
                        c.status === 'unread' 
                          ? 'bg-red-500/10 text-red-600 border-red-500/20' 
                          : c.status === 'replied' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                      }`}>
                        {c.status === 'unread' ? '未读' : c.status === 'read' ? '已读' : '已回复'}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1 font-medium italic">"{c.message}"</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>访客: {c.name}</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 运行日志 (科技感) */}
          <div className="bg-card border-2 border-border rounded-xl p-6 pop-shadow">
            <h4 className="text-xs font-heading font-bold text-foreground flex items-center space-x-2 border-b-2 border-border pb-3 mb-4">
              <Terminal className="h-4 w-4 text-primary" />
              <span>控制台状态 // CONSOLE</span>
            </h4>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex items-start justify-between p-2 bg-background border border-border rounded">
                <span className="text-muted-foreground">STATS_SYNC // 统计同步</span>
                <span className="text-emerald-500 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-start justify-between p-2 bg-background border border-border rounded">
                <span className="text-muted-foreground">DB_STATUS // 数据库</span>
                <span className="text-emerald-500 font-bold">ONLINE</span>
              </div>
              <div className="flex items-start justify-between p-2 bg-background border border-border rounded">
                <span className="text-muted-foreground">UPLOAD_DRIVER // 上传驱动</span>
                <span className="text-foreground font-bold">LOCAL_FS</span>
              </div>
            </div>
          </div>
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
