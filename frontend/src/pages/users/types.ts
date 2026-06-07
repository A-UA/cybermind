export interface IRole {
  id: number
  name: string
  code: string
  description?: string
  permissions: string[]
}

export interface IUser {
  id: number
  username: string
  nickname?: string
  email?: string
  avatar?: string
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
