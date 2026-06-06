/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}

/** 分页数据 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string | null
  avatar: string | null
  is_active: boolean
  roles: string[]
  permissions: string[]
}

/** Token 响应 */
export interface TokenResponse {
  access_token: string
  token_type: string
}
