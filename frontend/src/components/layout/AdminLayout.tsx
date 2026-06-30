import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import AppThemeSettings from '@/components/business/AppThemeSettings'
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
  User,
  ChevronRight,
  Menu,
} from 'lucide-react'

// 定义菜单项
interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<any>
  permission?: string
}

const MENU_ITEMS: MenuItem[] = [
  { name: '工作看板', path: '/', icon: LayoutDashboard },
  { name: 'Banner 管理', path: '/banners', icon: Image, permission: 'banner:read' },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 路由变化时关闭侧边栏（移动端）
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  // 窗口大小变化时，如果切换到桌面端则自动关闭侧边栏状态
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const currentPage = filteredMenu.find(item => item.path === location.pathname)

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 border-r border-sidebar-border bg-sidebar flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-out
        lg:static lg:transform-none lg:z-20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* 顶部 Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center space-x-2 select-none group">
            <span className="text-xl font-heading text-foreground tracking-tight">Cybermind</span>
            <span className="text-[10px] font-sans font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              CMS
            </span>
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
              >
                <Icon className={`mr-3 h-[18px] w-[18px] transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={1.75} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* 用户底部面板 */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent transition-colors group">
            <div className="flex items-center space-x-2.5 min-w-0">
              {/* 头像 */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              <div className="truncate text-sm leading-tight">
                <p className="font-semibold truncate text-foreground text-[13px]">
                  {user?.nickname || user?.username || '管理员'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {user?.roles.includes('super_admin') ? '超级管理员' : '系统操作员'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* 顶部工具栏 */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center space-x-2 text-sm text-foreground">
            {/* 移动端汉堡菜单按钮 */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer lg:hidden"
              title="打开菜单"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {/* 面包屑 */}
            <span className="text-muted-foreground hidden sm:block text-[13px]">主控面板</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 hidden sm:block" strokeWidth={1.5} />
            <span className="font-semibold text-[13px]">
              {currentPage?.name || '概览'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* 主题切换 */}
            <AppThemeSettings />

            {/* 状态指示器 */}
            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-medium select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span className="hidden sm:inline">系统正常</span>
            </div>
          </div>
        </header>

        {/* 内容主体 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
