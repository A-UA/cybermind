import { Layers, BookOpen } from 'lucide-react'
import type { INewsStats } from '../types'

interface NewsStatsCardsProps {
  stats?: INewsStats
}

export default function NewsStatsCards({ stats }: NewsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-[#E8F4FD] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow flex items-center justify-between">
        <div>
          <span className="text-[10px] text-foreground font-heading font-bold uppercase tracking-wider block">全站总文章数 / TOTAL POSTS</span>
          <span className="text-4xl font-heading font-bold mt-2.5 block text-foreground select-all">
            {stats?.total_articles ?? 0}
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-background border-2 border-border flex items-center justify-center text-primary font-bold">
          <Layers className="h-6 w-6" />
        </div>
      </div>

      <div className="p-6 bg-[#FEF9E7] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow flex items-center justify-between">
        <div>
          <span className="text-[10px] text-foreground font-heading font-bold uppercase tracking-wider block">累计浏览总量 / VIEW COUNTS</span>
          <span className="text-4xl font-heading font-bold mt-2.5 block text-foreground select-all">
            {stats?.total_views ?? 0}
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-background border-2 border-border flex items-center justify-center text-primary font-bold">
          <BookOpen className="h-6 w-6" />
        </div>
      </div>

      <div className="p-6 bg-[#E8F8F5] dark:bg-[#1E293B] border-2 border-border rounded-xl pop-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-foreground font-heading font-bold uppercase tracking-wider">
          <span>阅读量 Top 1 热门 / LEADER</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-border animate-pulse" />
        </div>
        <p className="text-xs font-bold text-foreground truncate mt-3 select-all" title={stats && stats.hot_articles.length > 0 ? stats.hot_articles[0].title : ''}>
          {stats && stats.hot_articles.length > 0 ? stats.hot_articles[0].title : '暂无'}
        </p>
        <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono font-bold">
          阅读量: {stats && stats.hot_articles.length > 0 ? stats.hot_articles[0].view_count : 0}
        </p>
      </div>
    </div>
  )
}
