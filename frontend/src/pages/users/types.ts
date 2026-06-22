export interface IRole {
  id: number
  name: string
  code: string
  description: string | null
  permissions: string[]
}

export interface IUser {
  id: number
  username: string
  nickname: string | null
  email: string | null
  avatar: string | null
  is_active: boolean
  roles: string[]
  created_at: string
}

export interface IPermission {
  id: number
  code: string
  name: string
  module: string
}
