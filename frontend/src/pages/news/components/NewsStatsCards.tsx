import { Layers, BookOpen } from 'lucide-react'
import type { INewsStats } from '../types'
import AppStatsCard from '@/components/common/AppStatsCard'

interface NewsStatsCardsProps {
  stats?: INewsStats
}

export default function NewsStatsCards({ stats }: NewsStatsCardsProps) {
  const hotArticle = stats?.hot_articles?.[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppStatsCard
        title="全站总文章数"
        value={stats?.total_articles ?? 0}
        icon={<Layers className="h-5 w-5" strokeWidth={1.5} />}
        accentColor="hsl(220, 50%, 55%)"
      />

      <AppStatsCard
        title="累计浏览总量"
        value={stats?.total_views ?? 0}
        icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
        accentColor="hsl(24, 85%, 48%)"
      />

      <div className="relative bg-card rounded-2xl elevation-1 hover:elevation-2 transition-shadow p-5 overflow-hidden group">
        {/* 左侧色条装饰 */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-emerald-500"
        />

        <div className="flex flex-col h-full justify-between pl-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>热门文章 Top 1</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <p
            className="text-[13px] font-medium text-foreground truncate select-all block mt-1"
            title={hotArticle ? hotArticle.title : ''}
          >
            {hotArticle ? hotArticle.title : '暂无数据'}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            阅读量: {hotArticle ? hotArticle.view_count : 0} 次
          </p>
        </div>
      </div>
    </div>
  )
}
