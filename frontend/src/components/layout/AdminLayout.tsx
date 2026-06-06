import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import {
  LayoutDashboard,
  Image,
  FileText,
  Phone,
  HelpCircle,
  Video,
  Settings,
  Users,
  LogOut,
  User
} from 'lucide-react'

// 定义菜单项
interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<any>
  permission?: string
}

const MENU_ITEMS: MenuItem[] = [
  { name: '数据看板', path: '/', icon: LayoutDashboard }, // 默认显示
  { name: 'Banner管理', path: '/banners', icon: Image, permission: 'banner:read' },
  { name: '新闻资讯', path: '/news', icon: FileText, permission: 'news:read' },
  { name: '帮助中心', path: '/help', icon: HelpCircle, permission: 'help:read' },
  { name: '操作视频', path: '/videos', icon: Video, permission: 'video:read' },
  { name: '联系我们', path: '/contacts', icon: Phone, permission: 'contact:read' },
  { name: '用户管理', path: '/users', icon: Users, permission: 'user:read' },
  { name: '站点配置', path: '/config', icon: Settings, permission: 'config:read' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasPermission } = useAuthStore()

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      // 忽略登出请求报错，直接清除本地状态
    }
    logout()
    navigate('/login', { replace: true })
  }

  // 过滤当前用户拥有权限的菜单项
  const filteredMenu = MENU_ITEMS.filter(item => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 border-b border-slate-800 flex items-center px-6">
          <Link to="/" className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            CyberMind CMS
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenu.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* 用户底部栏 */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold truncate text-slate-200">
                  {user?.nickname || user?.username || '管理员'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.roles.includes('super_admin') ? '超级管理员' : '普通用户'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all cursor-pointer"
              title="退出登录"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-200">
            {filteredMenu.find(item => item.path === location.pathname)?.name || '后台管理'}
          </h2>
          <div className="flex items-center space-x-4">
            {/* 统计指标或用户信息 */}
            <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              系统运行中
            </span>
          </div>
        </header>

        {/* 内容主体 */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
