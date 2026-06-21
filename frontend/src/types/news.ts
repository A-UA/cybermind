/** 新闻文章 */
export interface INewsArticle {
  id: number
  title: string
  summary?: string
  content: string
  cover_image?: string
  category?: string
  tags?: string
  status: string
  view_count: number
  is_top: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

/** 新闻统计数据 */
export interface INewsStats {
  total_articles: number
  total_views: number
  hot_articles: { id: number; title: string; view_count: number }[]
}
