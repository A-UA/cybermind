/** 总览指标 */
export interface IOverview {
  total_pv: number
  today_uv: number
  news_count: number
  pending_contact_count: number
}

/** 趋势折线图数据项 */
export interface ITrendItem {
  date: string
  pv: number
  uv: number
}

/** 热门页面排行项 */
export interface ITopPage {
  page_path: string
  views: number
}

/** 最新文章摘要 */
export interface IRecentNews {
  id: number
  title: string
  category?: string
  created_at: string
  view_count: number
}

/** 最新留言摘要 */
export interface IRecentContact {
  id: number
  subject: string
  message: string
  name: string
  status: string
  created_at: string
}
