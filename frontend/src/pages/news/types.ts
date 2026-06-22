export interface INewsArticle {
  id: number
  title: string
  summary: string | null
  content: string
  cover_image: string | null
  category: string | null
  tags: string | null
  status: string
  view_count: number
  is_top: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface INewsStats {
  total_articles: number
  total_views: number
  hot_articles: { id: number; title: string; view_count: number }[]
}
