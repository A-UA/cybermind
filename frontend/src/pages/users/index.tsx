import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  CheckSquare,
  Shield,
  UserCheck,
  UserX,
  X,
  Key,
  Layers
} from 'lucide-react'

// 数据接口定义
interface IRole {
  id: number
  name: string
  code: string
  description?: string
  permissions: string[]
}

interface IUser {
  id: number
  username: string
  nickname?: string
  email?: string
  avatar?: string
  is_active: boolean
  roles: string[]
  created_at: string
}

interface IPermission {
  id: number
  code: string
  name: string
  module: string
}

// 模块中文对照字典
const MODULE_NAME_MAP: Record<string, string> = {
  user: '用户管理',
  role: '角色权限',
  banner: '轮播图管理',
  news: '新闻资讯',
  contact: '客户留言',
  help: '帮助中心',
  video: '操作视频',
  config: '系统配置',
  stats: '数据看板'
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')

  // 用户分页与搜索状态
  const [userPage, setUserPage] = useState(1)
  const [userPageSize] = useState(15)
  const [userSearch, setUserSearch] = useState('')

  // 选中的实体状态用于弹框
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null)

  // 弹窗可见性
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [isAssignPermOpen, setIsAssignPermOpen] = useState(false)

  // 用户表单状态
  const [usernameVal, setUsernameVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const [nicknameVal, setNicknameVal] = useState('')
  const [emailVal, setEmailVal] = useState('')
  const [isActiveVal, setIsActiveVal] = useState(true)

  // 角色表单状态
  const [roleNameVal, setRoleNameVal] = useState('')
  const [roleCodeVal, setRoleCodeVal] = useState('')
  const [roleDescVal, setRoleDescVal] = useState('')

  // 关联配置的复选框临时存储
  const [tempRoleIds, setTempRoleIds] = useState<number[]>([])
  const [tempPermIds, setTempPermIds] = useState<number[]>([])

  // ==================== 1. API 数据拉取 ====================

  // 获取用户列表
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery<{
    items: IUser[]
    total: number
  }>({
    queryKey: ['users', userPage, userSearch],
    queryFn: async () => {
      const params: any = { page: userPage, page_size: userPageSize }
      if (userSearch.trim()) params.keyword = userSearch
      const res = await apiClient.get('/users', { params })
      return res.data.data
    }
  })

  // 获取角色列表
  const { data: roles = [], isLoading: isRolesLoading, refetch: refetchRoles } = useQuery<IRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.get('/roles')
      return res.data.data
    }
  })

  // 获取所有权限字典
  const { data: permissions = [] } = useQuery<IPermission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await apiClient.get('/roles/permissions')
      return res.data.data
    }
  })

  const usersList = usersData?.items || []
  const userTotal = usersData?.total || 0
  const userTotalPages = Math.ceil(userTotal / userPageSize)

  // ==================== 2. 用户 CRUD Mutation ====================

  const saveUserMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        nickname: nicknameVal || null,
        email: emailVal || null,
        is_active: isActiveVal
      }
      if (passwordVal.trim()) payload.password = passwordVal

      if (selectedUser) {
        // 更新用户
        await apiClient.put(`/users/${selectedUser.id}`, payload)
      } else {
        // 新增用户
        payload.username = usernameVal
        payload.password = passwordVal || '12345678' // 默认初始密码
        await apiClient.post('/users', payload)
      }
    },
    onSuccess: () => {
      toast.success(selectedUser ? '用户信息已更新' : '创建新管理员成功')
      setIsUserModalOpen(false)
      refetchUsers()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存管理员信息失败')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`)
    },
    onSuccess: () => {
      toast.success('管理员已被成功禁用(软删除)')
      refetchUsers()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '禁用操作失败')
    }
  })

  // ==================== 3. 角色 CRUD Mutation ====================

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: roleNameVal,
        description: roleDescVal || null
      }
      if (selectedRole) {
        await apiClient.put(`/roles/${selectedRole.id}`, payload)
      } else {
        const createPayload = { ...payload, code: roleCodeVal }
        await apiClient.post('/roles', createPayload)
      }
    },
    onSuccess: () => {
      toast.success(selectedRole ? '角色基本信息已修改' : '成功创建新角色')
      setIsRoleModalOpen(false)
      refetchRoles()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存角色失败')
    }
  })

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/roles/${id}`)
    },
    onSuccess: () => {
      toast.success('角色已成功物理删除')
      refetchRoles()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '删除角色失败')
    }
  })

  // ==================== 4. 分配授权 Mutation ====================

  // 用户分配角色
  const assignRolesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return
      await apiClient.put(`/users/${selectedUser.id}/roles`, { role_ids: tempRoleIds })
    },
    onSuccess: () => {
      toast.success('角色分配已成功更新')
      setIsAssignRoleOpen(false)
      refetchUsers()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '更新授权失败')
    }
  })

  // 角色分配权限
  const assignPermissionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) return
      await apiClient.put(`/roles/${selectedRole.id}/permissions`, { permission_ids: tempPermIds })
    },
    onSuccess: () => {
      toast.success('角色权限配置已生效')
      setIsAssignPermOpen(false)
      refetchRoles()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '权限分配失败')
    }
  })

  // ==================== 5. 点击响应处理 ====================

  const handleCreateUserClick = () => {
    setSelectedUser(null)
    setUsernameVal('')
    setPasswordVal('')
    setNicknameVal('')
    setEmailVal('')
    setIsActiveVal(true)
    setIsUserModalOpen(true)
  }

  const handleEditUserClick = (u: IUser) => {
    setSelectedUser(u)
    setUsernameVal(u.username)
    setPasswordVal('')
    setNicknameVal(u.nickname || '')
    setEmailVal(u.email || '')
    setIsActiveVal(u.is_active)
    setIsUserModalOpen(true)
  }

  const handleAssignRoleClick = (u: IUser) => {
    setSelectedUser(u)
    // 找出这个用户当前拥有的角色 id 列表，并预勾选
    const currentRoleIds = roles
      .filter((r) => u.roles.includes(r.code))
      .map((r) => r.id)
    setTempRoleIds(currentRoleIds)
    setIsAssignRoleOpen(true)
  }

  const handleCreateRoleClick = () => {
    setSelectedRole(null)
    setRoleNameVal('')
    setRoleCodeVal('')
    setRoleDescVal('')
    setIsRoleModalOpen(true)
  }

  const handleEditRoleClick = (r: IRole) => {
    setSelectedRole(r)
    setRoleNameVal(r.name)
    setRoleCodeVal(r.code)
    setRoleDescVal(r.description || '')
    setIsRoleModalOpen(true)
  }

  const handleAssignPermClick = (r: IRole) => {
    setSelectedRole(r)
    // 找出这个角色当前拥有的权限 id 列表，并预勾选
    const currentPermIds = permissions
      .filter((p) => r.permissions.includes(p.code))
      .map((p) => p.id)
    setTempPermIds(currentPermIds)
    setIsAssignPermOpen(true)
  }

  // 权限按 Module 分组
  const groupedPermissions = permissions.reduce<Record<string, IPermission[]>>((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = []
    acc[curr.module].push(curr)
    return acc
  }, {})

  return (
    <div className="space-y-6 text-foreground font-sans">
      
      {/* 顶部控制栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-heading font-bold tracking-wider uppercase">
              管理员与 RBAC 权限配置中心
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 font-mono">
              SYSTEM_ADMIN_RBAC_CONTROL_UNIT
            </p>
          </div>
        </div>

        {/* 撞色选项卡按钮组 */}
        <div className="flex bg-accent/40 border-2 border-border p-1 rounded-lg max-w-fit text-xs font-heading font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-primary text-primary-foreground pop-shadow-sm border border-border scale-[1.02]' : 'text-foreground hover:bg-accent/40'
            }`}
          >
            管理员管理
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'roles' ? 'bg-primary text-primary-foreground pop-shadow-sm border border-border scale-[1.02]' : 'text-foreground hover:bg-accent/40'
            }`}
          >
            角色与权限
          </button>
        </div>
      </div>

      {/* ==================== 选项卡1：管理员管理 ==================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* 操作过滤条 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">检索到 {userTotal} 名系统运维人员</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="搜索用户名/昵称..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1) }}
                  className="px-3.5 pl-8 py-2 h-9 bg-background border-2 border-border text-foreground text-xs rounded-lg outline-none font-semibold w-52 placeholder-muted-foreground/60"
                />
                <Search className="h-3.5 w-3.5 absolute left-3 text-muted-foreground/75" />
              </div>

              <button
                onClick={() => refetchUsers()}
                className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent pop-shadow-sm pop-press rounded-lg cursor-pointer"
                title="刷新数据"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={handleCreateUserClick}
                className="px-4 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold flex items-center space-x-1.5 pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>新增管理员 ADD_USER</span>
              </button>
            </div>
          </div>

          {/* 表格 */}
          <div className="border-2 border-border bg-card pop-shadow rounded-xl overflow-hidden">
            {isUsersLoading ? (
              <div className="h-64 flex flex-col justify-center items-center space-y-3">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold">正在载入系统用户清单...</span>
              </div>
            ) : usersList.length === 0 ? (
              <div className="h-64 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-muted-foreground font-semibold">未找到符合搜索条件的管理员</span>
              </div>
            ) : (
              <Table className="text-xs">
                <TableHeader className="bg-accent border-b-2 border-border">
                  <TableRow className="border-b-2 border-border hover:bg-transparent">
                    <TableHead className="font-bold text-foreground w-12">ID</TableHead>
                    <TableHead className="font-bold text-foreground">账户/用户名</TableHead>
                    <TableHead className="font-bold text-foreground">昵称</TableHead>
                    <TableHead className="font-bold text-foreground">绑定的邮箱</TableHead>
                    <TableHead className="font-bold text-foreground w-44">当前角色</TableHead>
                    <TableHead className="font-bold text-foreground w-24 text-center">状态</TableHead>
                    <TableHead className="font-bold text-foreground w-36 text-center">授权与操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((u) => (
                    <TableRow key={u.id} className="border-b-2 border-border hover:bg-secondary/40">
                      <TableCell className="font-bold text-muted-foreground/80 font-mono">#{u.id}</TableCell>
                      <TableCell className="font-bold text-foreground font-mono">{u.username}</TableCell>
                      <TableCell className="font-semibold text-foreground">{u.nickname || '-'}</TableCell>
                      <TableCell className="font-mono text-muted-foreground font-semibold select-all">{u.email || '-'}</TableCell>
                      
                      {/* 角色徽章 */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length === 0 ? (
                            <span className="text-[9px] text-muted-foreground/50 font-bold">无角色</span>
                          ) : (
                            u.roles.map((rCode) => (
                              <span
                                key={rCode}
                                className={`px-2 py-0.5 border border-border text-[9px] font-bold rounded shadow-sm select-none ${
                                  rCode === 'super_admin'
                                    ? 'bg-amber-300 text-black'
                                    : rCode === 'content_admin'
                                    ? 'bg-blue-300 text-black'
                                    : 'bg-emerald-300 text-black'
                                }`}
                              >
                                {rCode}
                              </span>
                            ))
                          )}
                        </div>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {u.is_active ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">活动中</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-[10px] font-bold text-muted-foreground/60">禁用</span>
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* 操作 */}
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleAssignRoleClick(u)}
                            className="px-2 py-1 bg-[#F5EEF8] border border-border text-black font-bold text-[10px] hover:bg-accent rounded-md cursor-pointer pop-shadow-xs"
                            title="修改角色分配"
                          >
                            授权角色
                          </button>
                          <button
                            onClick={() => handleEditUserClick(u)}
                            className="p-1 border border-border bg-background hover:bg-accent rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
                            title="编辑信息"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`确认要禁用管理员 ${u.username} 吗？`)) {
                                deleteUserMutation.mutate(u.id)
                              }
                            }}
                            className="p-1 border border-border bg-background hover:bg-destructive hover:text-destructive-foreground rounded-md cursor-pointer text-muted-foreground"
                            title="禁用管理员"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 分页 */}
            {userTotalPages > 1 && (
              <div className="p-4 border-t-2 border-border flex items-center justify-between text-xs bg-accent/20">
                <span className="font-semibold text-muted-foreground">
                  共 {userTotal} 个管理员，当前页 {userPage} / {userTotalPages}
                </span>
                <div className="flex space-x-2">
                  <button
                    disabled={userPage === 1}
                    onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 border-2 border-border bg-background font-bold rounded-lg pop-shadow-sm pop-press disabled:opacity-40 cursor-pointer"
                  >
                    上一页
                  </button>
                  <button
                    disabled={userPage >= userTotalPages}
                    onClick={() => setUserPage((p) => Math.min(p + 1, userTotalPages))}
                    className="px-3 py-1.5 border-2 border-border bg-background font-bold rounded-lg pop-shadow-sm pop-press disabled:opacity-40 cursor-pointer"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 选项卡2：角色与权限管理 ==================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          
          {/* 操作过滤条 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">维护系统安全策略与访问粒度</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => refetchRoles()}
                className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent pop-shadow-sm pop-press rounded-lg cursor-pointer"
                title="刷新角色"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={handleCreateRoleClick}
                className="px-4 py-2 bg-[#FEF9E7] text-black border-2 border-border font-heading font-bold flex items-center space-x-1.5 pop-shadow-sm pop-press rounded-lg cursor-pointer text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>新增角色 ADD_ROLE</span>
              </button>
            </div>
          </div>

          {/* 表格 */}
          <div className="border-2 border-border bg-card pop-shadow rounded-xl overflow-hidden">
            {isRolesLoading ? (
              <div className="h-64 flex flex-col justify-center items-center space-y-3">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold">正在同步系统角色字典...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="h-64 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-muted-foreground font-semibold">系统内暂无任何角色条目</span>
              </div>
            ) : (
              <Table className="text-xs">
                <TableHeader className="bg-accent border-b-2 border-border">
                  <TableRow className="border-b-2 border-border hover:bg-transparent">
                    <TableHead className="font-bold text-foreground w-12">ID</TableHead>
                    <TableHead className="font-bold text-foreground w-36">角色名称</TableHead>
                    <TableHead className="font-bold text-foreground w-36">角色标识/代码</TableHead>
                    <TableHead className="font-bold text-foreground">说明描述</TableHead>
                    <TableHead className="font-bold text-foreground w-28 text-center">已配权限数</TableHead>
                    <TableHead className="font-bold text-foreground w-40 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => (
                    <TableRow key={r.id} className="border-b-2 border-border hover:bg-secondary/40">
                      <TableCell className="font-bold text-muted-foreground/80 font-mono">#{r.id}</TableCell>
                      <TableCell className="font-bold text-foreground">{r.name}</TableCell>
                      <TableCell className="font-mono text-primary font-bold">{r.code}</TableCell>
                      <TableCell className="text-muted-foreground font-semibold">{r.description || '无具体说明'}</TableCell>
                      
                      {/* 已配权限数量 */}
                      <TableCell className="text-center">
                        <span className="px-2 py-0.5 border border-border bg-accent text-[10px] font-bold font-mono rounded-lg">
                          {r.permissions.length} 个
                        </span>
                      </TableCell>

                      {/* 操作 */}
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleAssignPermClick(r)}
                            className="px-2.5 py-1 bg-[#E8F4FD] border border-border text-black font-bold text-[10px] hover:bg-accent rounded-md cursor-pointer pop-shadow-xs flex items-center space-x-1"
                            title="配置角色权限"
                          >
                            <Layers className="h-3 w-3" />
                            <span>分配权限</span>
                          </button>
                          <button
                            onClick={() => handleEditRoleClick(r)}
                            className="p-1 border border-border bg-background hover:bg-accent rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
                            title="修改角色"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`确定要物理删除角色 [${r.name}] 吗？`)) {
                                deleteRoleMutation.mutate(r.id)
                              }
                            }}
                            className="p-1 border border-border bg-background hover:bg-destructive hover:text-destructive-foreground rounded-md cursor-pointer text-muted-foreground"
                            title="物理删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* ==================== 弹窗1：新增/编辑管理员 ==================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-md w-full overflow-hidden flex flex-col justify-between">
            <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center space-x-1.5">
                <Key className="h-4 w-4 text-primary" />
                <span>{selectedUser ? '编辑管理员属性' : '新增管理员账户'}</span>
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); saveUserMutation.mutate() }}
              className="p-6 bg-background space-y-4 text-xs font-semibold text-foreground"
            >
              {/* 用户名 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  账户名 / USERNAME (创建后不可改)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!selectedUser}
                  placeholder="请输入登录账户名..."
                  value={usernameVal}
                  onChange={(e) => setUsernameVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-bold text-xs disabled:opacity-60"
                />
              </div>

              {/* 密码 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  {selectedUser ? '登录密码 / PASSWORD (留空代表不修改)' : '登录密码 / PASSWORD (最少 8 位)'}
                </label>
                <input
                  type="password"
                  required={!selectedUser}
                  placeholder={selectedUser ? '不修改请留空...' : '输入至少8位密码...'}
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-mono text-xs"
                />
              </div>

              {/* 昵称 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  昵称 / DISPLAY NICKNAME
                </label>
                <input
                  type="text"
                  placeholder="输入昵称..."
                  value={nicknameVal}
                  onChange={(e) => setNicknameVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none text-xs"
                />
              </div>

              {/* 邮箱 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  电子邮箱 / EMAIL
                </label>
                <input
                  type="email"
                  placeholder="例如 info@example.com"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none text-xs"
                />
              </div>

              {/* 启用状态 */}
              <div className="pt-2 border-t border-border/20">
                <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActiveVal}
                    onChange={(e) => setIsActiveVal(e.target.checked)}
                    className="w-4 h-4 bg-background border-2 border-border text-primary focus:ring-0 rounded-md cursor-pointer"
                  />
                  <span className="text-xs font-bold text-foreground">启用此管理员账号 (ACTIVE)</span>
                </label>
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-end space-x-2.5 pt-4 border-t-2 border-border">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-border bg-background hover:bg-accent rounded-lg font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saveUserMutation.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold rounded-lg pop-shadow-sm pop-press cursor-pointer disabled:opacity-60"
                >
                  {saveUserMutation.isPending ? '正在保存...' : '确认保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 弹窗2：新增/编辑角色 ==================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-md w-full overflow-hidden flex flex-col justify-between">
            <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center space-x-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>{selectedRole ? '编辑角色基本信息' : '创建新系统角色'}</span>
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); saveRoleMutation.mutate() }}
              className="p-6 bg-background space-y-4 text-xs font-semibold text-foreground"
            >
              {/* 角色名称 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  角色中文名称 / NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：内容管理员..."
                  value={roleNameVal}
                  onChange={(e) => setRoleNameVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-bold text-xs"
                />
              </div>

              {/* 角色标识/代码 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  角色标识代码 / CODE (创建后不可改)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!selectedRole}
                  placeholder="例如：content_admin (仅字母与下划线)..."
                  value={roleCodeVal}
                  onChange={(e) => setRoleCodeVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none font-mono text-xs disabled:opacity-60"
                />
              </div>

              {/* 角色描述 */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold block">
                  角色职责描述 / DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  placeholder="请输入对该角色权限范围的解释..."
                  value={roleDescVal}
                  onChange={(e) => setRoleDescVal(e.target.value)}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg outline-none text-xs"
                />
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-end space-x-2.5 pt-4 border-t-2 border-border">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 border border-border bg-background hover:bg-accent rounded-lg font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saveRoleMutation.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold rounded-lg pop-shadow-sm pop-press cursor-pointer disabled:opacity-60"
                >
                  {saveRoleMutation.isPending ? '正在保存...' : '确认保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 弹窗3：管理员分配角色 (多选框) ==================== */}
      {isAssignRoleOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-sm w-full overflow-hidden flex flex-col justify-between">
            <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-foreground">
                角色授权: {selectedUser.username}
              </h3>
              <button
                onClick={() => setIsAssignRoleOpen(false)}
                className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 bg-background space-y-4">
              <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase select-none">
                勾选分配角色 / ATTACH_ROLES
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {roles.map((r) => {
                  const isChecked = tempRoleIds.includes(r.id)
                  return (
                    <label
                      key={r.id}
                      className="flex items-center space-x-2.5 px-3 py-2 border-2 border-border rounded-lg bg-background hover:bg-accent/20 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setTempRoleIds((prev) => prev.filter((id) => id !== r.id))
                          } else {
                            setTempRoleIds((prev) => [...prev, r.id])
                          }
                        }}
                        className="w-4 h-4 text-primary border-2 border-border rounded cursor-pointer focus:ring-0"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-foreground">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{r.code}</p>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-end space-x-2.5 pt-4 border-t-2 border-border">
                <button
                  type="button"
                  onClick={() => setIsAssignRoleOpen(false)}
                  className="px-4 py-2 border border-border bg-background hover:bg-accent rounded-lg font-bold cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  onClick={() => assignRolesMutation.mutate()}
                  disabled={assignRolesMutation.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold rounded-lg pop-shadow-sm pop-press cursor-pointer text-xs disabled:opacity-60"
                >
                  {assignRolesMutation.isPending ? '提交中...' : '提交更改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 弹窗4：角色分配权限 (按模块分组) ==================== */}
      {isAssignPermOpen && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-2xl w-full overflow-hidden flex flex-col justify-between h-[90vh]">
            <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-heading font-bold text-sm text-foreground">
                  角色权限分配: {selectedRole.name}
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold font-mono mt-0.5">ROLE_IDENTIFIER: {selectedRole.code}</p>
              </div>
              <button
                onClick={() => setIsAssignPermOpen(false)}
                className="p-1 border-2 border-border bg-background hover:bg-accent rounded-lg pop-shadow-sm cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 分组内容区 */}
            <div className="p-6 bg-background overflow-y-auto space-y-6 flex-1 text-xs">
              
              {Object.keys(groupedPermissions).map((moduleName) => {
                const perms = groupedPermissions[moduleName]
                const moduleLabel = MODULE_NAME_MAP[moduleName] || moduleName.toUpperCase()

                return (
                  <div key={moduleName} className="bg-accent/20 border-2 border-border p-4 rounded-xl space-y-3">
                    <h4 className="font-heading font-bold text-foreground border-b border-border/40 pb-1.5 uppercase select-none">
                      {moduleLabel} // {moduleName.toUpperCase()}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {perms.map((p) => {
                        const isChecked = tempPermIds.includes(p.id)
                        return (
                          <label
                            key={p.id}
                            className="flex items-center space-x-2 bg-background border border-border/50 hover:border-border px-3 py-2 rounded-lg cursor-pointer select-none transition-all hover:bg-background/80"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setTempPermIds((prev) => prev.filter((id) => id !== p.id))
                                } else {
                                  setTempPermIds((prev) => [...prev, p.id])
                                }
                              }}
                              className="w-3.5 h-3.5 text-primary border-2 border-border rounded cursor-pointer focus:ring-0"
                            />
                            <div className="text-[11px]">
                              <p className="font-bold text-foreground">{p.name}</p>
                              <p className="text-[9px] text-muted-foreground font-mono">{p.code}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 底部按钮 */}
            <div className="p-4 bg-accent border-t-4 border-border flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] text-muted-foreground font-mono font-semibold">
                当前已勾选 {tempPermIds.length} 项权限 / CHECKED_ITEMS
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignPermOpen(false)}
                  className="px-4 py-2 border border-border bg-background hover:bg-accent rounded-lg font-bold cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  onClick={() => assignPermissionsMutation.mutate()}
                  disabled={assignPermissionsMutation.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground border-2 border-border font-heading font-bold rounded-lg pop-shadow-sm pop-press cursor-pointer text-xs disabled:opacity-60 flex items-center space-x-1"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>{assignPermissionsMutation.isPending ? '提交中...' : '保存更改'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
