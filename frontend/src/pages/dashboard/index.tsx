import { Link } from 'react-router'
import {
  TrendingUp, Eye, BookOpen, MessageSquare,
  Clock, ArrowRight, Activity, Terminal, RefreshCw,
} from 'lucide-react'
import {
  useOverview, useTrend, useTopPages,
  useRecentNews, useRecentContacts,
} from '@/queries/useStatsQuery'
import StatCard from './components/StatCard'
import TrendChart from './components/TrendChart'

export default function DashboardPage() {
  // 1. 获取总览指标
  const { data: overview, isLoading: isOverviewLoading } = useOverview()

  // 2. 获取趋势折线图
  const { data: trendData = [], isLoading: isTrendLoading } = useTrend(7)

  // 3. 获取热门页面排行
  const { data: topPages = [], isLoading: isTopPagesLoading } = useTopPages(5)

  // 4. 获取最新文章
  const { data: recentNews = [] } = useRecentNews()

  // 5. 获取最新客户留言
  const { data: recentContacts = [] } = useRecentContacts()

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
                {recentNews.map((n) => (
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
                {recentContacts.map((c) => (
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
