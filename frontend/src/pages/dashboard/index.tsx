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
    <div className="space-y-8 text-foreground font-sans pb-8">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AppStatsCard
          title="今日访客"
          value={isOverviewLoading ? '...' : todayUv.toLocaleString()}
          label="独立 IP 数 / 24h"
          icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
          accentColor="hsl(220, 50%, 55%)"
        />
        <AppStatsCard
          title="累计访问量"
          value={isOverviewLoading ? '...' : totalPv.toLocaleString()}
          label="全站总浏览次数"
          icon={<Eye className="h-5 w-5" strokeWidth={1.5} />}
          accentColor="hsl(24, 85%, 48%)"
        />
        <AppStatsCard
          title="文章总数"
          value={isOverviewLoading ? '...' : newsCount.toString()}
          label="已发布新闻"
          icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
          accentColor="hsl(160, 45%, 40%)"
        />
        <AppStatsCard
          title="待处理留言"
          value={isOverviewLoading ? '...' : pendingContactCount.toString()}
          label="条未回复"
          icon={<MessageSquare className="h-5 w-5" strokeWidth={1.5} />}
          accentColor={pendingContactCount > 0 ? 'hsl(0, 65%, 50%)' : 'hsl(160, 45%, 40%)'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要区域 (趋势图 + 排行榜) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 折线趋势图 */}
          <div className="bg-card rounded-2xl p-6 elevation-2">
            <h3 className="text-base font-heading text-foreground flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span>近 7 天访问趋势</span>
            </h3>
            {isTrendLoading ? (
              <div className="h-80 flex justify-center items-center text-[13px] text-muted-foreground gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} />
                正在加载统计数据...
              </div>
            ) : (
              <TrendChart data={trendData} />
            )}
          </div>

          {/* 热门访问页面排行 */}
          <div className="bg-card rounded-2xl p-6 elevation-2">
            <h3 className="text-base font-heading text-foreground flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span>热门内容排行</span>
            </h3>
            {isTopPagesLoading ? (
              <div className="h-48 flex justify-center items-center text-[13px] text-muted-foreground gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} />
                正在加载...
              </div>
            ) : topPages.length === 0 ? (
              <div className="h-48 flex flex-col justify-center items-center text-[13px] text-muted-foreground gap-2">
                <Inbox className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
                暂无访问数据
              </div>
            ) : (
              <div className="space-y-2">
                {topPages.map((page, index) => (
                  <div key={page.page_path} className="flex items-center justify-between py-3 px-4 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-semibold ${
                        index === 0 ? 'bg-primary/15 text-primary' : index === 1 ? 'bg-chart-2/15 text-chart-2' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-[13px] truncate text-foreground" title={page.page_path}>
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
        <div className="space-y-6">
          {/* 最新发布文章 */}
          <div className="bg-card rounded-2xl p-6 elevation-2">
            <h4 className="text-[13px] font-semibold text-foreground flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span>最新资讯</span>
              </span>
              <Link to="/news" className="text-[12px] text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
                <span>查看全部</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
              </Link>
            </h4>
            {recentNews.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">暂无已发布文章</div>
            ) : (
              <div className="space-y-2.5">
                {recentNews.map((n) => (
                  <div key={n.id} className="p-3 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-medium text-foreground line-clamp-1 flex-1">{n.title}</span>
                      <span className="px-2 py-0.5 bg-muted text-[11px] font-medium rounded-full text-muted-foreground whitespace-nowrap">
                        {n.category || '未分类'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" strokeWidth={1.5} />
                        <span>{n.view_count} 阅读</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 最新留言 */}
          <div className="bg-card rounded-2xl p-6 elevation-2">
            <h4 className="text-[13px] font-semibold text-foreground flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span>最新留言</span>
              </span>
              <Link to="/contacts" className="text-[12px] text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
                <span>查看全部</span>
                <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
              </Link>
            </h4>
            {recentContacts.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">暂无留言</div>
            ) : (
              <div className="space-y-2.5">
                {recentContacts.map((c) => (
                  <div key={c.id} className="p-3 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-medium text-foreground line-clamp-1 flex-1">{c.subject}</span>
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap ${
                        c.status === 'unread'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                          : c.status === 'replied'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        {c.status === 'unread' ? '未读' : c.status === 'read' ? '已读' : '已回复'}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-1 italic">"{c.message}"</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>访客: {c.name}</span>
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
