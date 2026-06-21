export interface IHelpCategory {
  id: number
  name: string
  sort_order: number
}

export interface IHelpQuestion {
  id: number
  category_id: number
  question: string
  answer: string
  sort_order: number
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
}
