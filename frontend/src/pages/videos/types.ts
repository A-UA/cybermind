export interface IOperationVideo {
  id: number
  title: string
  description?: string
  video_url: string
  cover_image?: string
  duration?: number
  category?: string
  sort_order: number
  is_active: boolean
  view_count: number
  created_by: number
  created_at: string
  updated_at: string
}
