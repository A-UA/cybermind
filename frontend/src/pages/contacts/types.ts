export interface IContactSubmission {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: string
  remark?: string
  processed_by?: number
  processed_by_username?: string
  processed_at?: string
  created_at: string
  updated_at: string
}
