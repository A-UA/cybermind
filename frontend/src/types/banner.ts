export interface IBanner {
  id: number
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
}

export interface IBannerCreate {
  title: string
  description?: string | null
  image_url: string
  link_url?: string | null
  sort_order: number
  is_active: boolean
}

export interface IBannerUpdate {
  title?: string
  description?: string | null
  image_url?: string
  link_url?: string | null
  sort_order?: number
  is_active?: boolean
}
