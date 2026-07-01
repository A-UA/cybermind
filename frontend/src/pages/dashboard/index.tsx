import { Link } from 'react-router'
import {
  TrendingUp, Eye, BookOpen, MessageSquare,
  Clock, ArrowRight, Activity, RefreshCw, Users, Inbox,
} from 'lucide-react'
import {
  useOverview, useTrend, useTopPages,
  useRecentNews, useRecentContacts,
} from '@/queries/useStatsQuery'
import AppStatsCard from '@/components/common/AppStatsCard'
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
    <div className="space-y-6 text-foreground font-sans pb-8">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppStatsCard
          title="今日访客"
          value={isOverviewLoading ? '...' : todayUv.toLocaleString()}
          label="独立 IP 数 / 24h"
          icon={<Users className="h-4.5 w-4.5" strokeWidth={1.5} />}
          accentColor="hsl(217, 91%, 60%)"
        />
        <AppStatsCard
          title="累计访问量"
          value={isOverviewLoading ? '...' : totalPv.toLocaleString()}
          label="全站总浏览次数"
          icon={<Eye className="h-4.5 w-4.5" strokeWidth={1.5} />}
          accentColor="hsl(142, 72%, 55%)"
        />
        <AppStatsCard
          title="文章总数"
          value={isOverviewLoading ? '...' : newsCount.toString()}
          label="已发布新闻"
          icon={<BookOpen className="h-4.5 w-4.5" strokeWidth={1.5} />}
          accentColor="hsl(263, 84%, 65%)"
        />
        <AppStatsCard
          title="待处理留言"
          value={isOverviewLoading ? '...' : pendingContactCount.toString()}
          label="条未回复"
          icon={<MessageSquare className="h-4.5 w-4.5" strokeWidth={1.5} />}
          accentColor={pendingContactCount > 0 ? 'hsl(0, 84%, 60%)' : 'hsl(142, 72%, 55%)'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左侧主要区域 (趋势图 + 排行榜) */}
        <div className="lg:col-span-2 space-y-5">
          {/* 折线趋势图 */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h3 className="text-[13px] font-semibold text-foreground flex items-center justify-between pb-3.5 mb-4 border-b border-border">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span>近 7 天访问趋势</span>
              </span>
            </h3>
            {isTrendLoading ? (
              <div className="h-80 flex justify-center items-center text-[13px] text-muted-foreground gap-2 font-mono">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" strokeWidth={1.5} />
                LOADING STATS...
              </div>
            ) : (
              <TrendChart data={trendData} />
            )}
          </div>

          {/* 热门访问页面排行 */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 pb-3.5 mb-4 border-b border-border">
              <Activity className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span>热门内容排行</span>
            </h3>
            {isTopPagesLoading ? (
              <div className="h-48 flex justify-center items-center text-[13px] text-muted-foreground gap-2 font-mono">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" strokeWidth={1.5} />
                LOADING...
              </div>
            ) : topPages.length === 0 ? (
              <div className="h-48 flex flex-col justify-center items-center text-[13px] text-muted-foreground gap-2">
                <Inbox className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
                暂无访问数据
              </div>
            ) : (
              <div className="space-y-1.5">
                {topPages.map((page, index) => (
                  <div key={page.page_path} className="flex items-center justify-between py-2 px-3 bg-muted/30 border border-border/20 rounded-md hover:bg-accent/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-medium ${
                        index === 0 ? 'bg-primary/10 text-primary' : index === 1 ? 'bg-chart-2/10 text-chart-2' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-[13px] truncate text-foreground font-mono" title={page.page_path}>
                        {page.page_path}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground whitespace-nowrap ml-3">
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{page.views} 次</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧边栏区域 (最新消息 + 留言) */}
        <div className="space-y-5">
          {/* 最新发布文章 */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h4 className="text-[13px] font-semibold text-foreground flex items-center justify-between pb-3.5 mb-4 border-b border-border">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span>最新资讯</span>
              </span>
              <Link to="/news" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 font-mono font-medium transition-colors">
                <span>VIEW ALL</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </h4>
            {recentNews.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">暂无已发布文章</div>
            ) : (
              <div className="space-y-2">
                {recentNews.map((n) => (
                  <div key={n.id} className="p-3 bg-muted/30 border border-border/20 rounded-md hover:bg-accent/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-medium text-foreground line-clamp-1 flex-1">{n.title}</span>
                      <span className="px-1.5 py-0.5 bg-muted text-[10px] font-medium rounded text-muted-foreground whitespace-nowrap">
                        {n.category || '未分类'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" strokeWidth={1.5} />
                        <span>{n.view_count}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 最新留言 */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h4 className="text-[13px] font-semibold text-foreground flex items-center justify-between pb-3.5 mb-4 border-b border-border">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span>最新留言</span>
              </span>
              <Link to="/contacts" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 font-mono font-medium transition-colors">
                <span>VIEW ALL</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </h4>
            {recentContacts.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">暂无留言</div>
            ) : (
              <div className="space-y-2">
                {recentContacts.map((c) => (
                  <div key={c.id} className="p-3 bg-muted/30 border border-border/20 rounded-md hover:bg-accent/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-medium text-foreground line-clamp-1 flex-1">{c.subject}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap ${
                        c.status === 'unread'
                          ? 'bg-red-500/10 text-red-500'
                          : c.status === 'replied'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {c.status === 'unread' ? '未读' : c.status === 'read' ? '已读' : '已回复'}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-1 italic">"{c.message}"</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>{c.name}</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
