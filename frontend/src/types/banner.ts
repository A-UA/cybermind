export interface IBanner {
  id: number
  title: string
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
  image_url: string
  link_url?: string | null
  sort_order: number
  is_active: boolean
}

export interface IBannerUpdate {
  title?: string
  image_url?: string
  link_url?: string | null
  sort_order?: number
  is_active?: boolean
}
