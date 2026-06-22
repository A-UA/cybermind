export interface IOperationVideo {
  id: number
  title: string
  description: string | null
  video_url: string
  cover_image: string | null
  duration: number | null
  category: string | null
  sort_order: number
  is_active: boolean
  view_count: number
  created_by: number
  created_at: string
  updated_at: string
}
