import { Layers, BookOpen } from 'lucide-react'
import type { INewsStats } from '../types'
import AppStatsCard from '@/components/common/AppStatsCard'

interface NewsStatsCardsProps {
  stats?: INewsStats
}

export default function NewsStatsCards({ stats }: NewsStatsCardsProps) {
  const hotArticle = stats?.hot_articles?.[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AppStatsCard
        title="全站总文章数"
        value={stats?.total_articles ?? 0}
        icon={<Layers className="h-4.5 w-4.5" strokeWidth={1.5} />}
        accentColor="hsl(217, 91%, 60%)"
      />

      <AppStatsCard
        title="累计浏览总量"
        value={stats?.total_views ?? 0}
        icon={<BookOpen className="h-4.5 w-4.5" strokeWidth={1.5} />}
        accentColor="hsl(142, 72%, 55%)"
      />

      <div className="relative bg-card border border-border rounded-lg shadow-sm p-4 overflow-hidden group select-none">
        {/* 左侧精密单像素指示条 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-500"
        />

        <div className="flex flex-col h-full justify-between pl-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
            <span>热门文章 Top 1</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <p
            className="text-[13px] font-medium text-foreground truncate select-all block mt-1.5"
            title={hotArticle ? hotArticle.title : ''}
          >
            {hotArticle ? hotArticle.title : '暂无数据'}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono mt-1">
            阅读量: {hotArticle ? hotArticle.view_count : 0} 次
          </p>
        </div>
      </div>
    </div>
  )
}
