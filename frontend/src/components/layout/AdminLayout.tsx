import React, { useState, useEffect } from 'react'
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
  User,
  Compass,
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

  return (
    <div className="flex h-screen bg-background pop-brutal-bg text-foreground font-sans overflow-hidden">
      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 border-r-2 border-border bg-sidebar flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out
        lg:static lg:transform-none lg:z-20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* 顶部 Logo - 醒目实体波普风 */}
        <div className="h-16 flex items-center px-6 justify-between border-b-2 border-border">
          <Link to="/" className="text-2xl font-heading font-bold tracking-tight text-foreground flex items-center space-x-2.5 select-none">
            <span>Cybermind</span>
            <span className="text-[10px] font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 border-2 border-border rounded-lg pop-shadow-sm rotate-[4deg] scale-90 inline-block">
              CMS
            </span>
          </Link>
        </div>

        {/* 导航菜单 - 实体拼贴菜单 */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 text-xs font-semibold rounded-lg border-2 transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-border pop-shadow-sm -translate-x-[2px] -translate-y-[2px]'
                    : 'bg-transparent text-muted-foreground border-transparent hover:bg-accent/40 hover:text-foreground hover:border-border hover:pop-shadow-sm hover:-translate-x-[1px] hover:-translate-y-[1px]'
                }`}
              >
                <Icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* 用户底部面板 - 实体小卡纸 */}
        <div className="p-4 border-t-2 border-border bg-sidebar">
          <div className="flex items-center justify-between bg-card p-3 rounded-lg border-2 border-border pop-shadow-sm">
            <div className="flex items-center space-x-2.5 min-w-0">
              {/* 圆角正方形头像 */}
              <div className="w-8 h-8 rounded-lg bg-primary/10 border-2 border-border flex items-center justify-center flex-shrink-0 text-primary font-heading font-bold">
                <User className="h-4 w-4" />
              </div>
              <div className="truncate text-xs leading-tight font-medium">
                <p className="font-bold truncate text-foreground">
                  {user?.nickname || user?.username || '管理员'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {user?.roles.includes('super_admin') ? '超级管理员' : '系统操作员'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border-2 border-border bg-background hover:bg-destructive hover:text-destructive-foreground pop-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* 顶部工具栏 - 纸面切割感 */}
        <header className="h-16 border-b-2 border-border bg-card flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center space-x-2.5 text-xs font-semibold text-foreground">
            {/* 移动端汉堡菜单按钮 */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 border-2 border-border bg-background hover:bg-accent text-foreground transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer lg:hidden"
              title="打开菜单"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Compass className="h-4 w-4 text-primary hidden sm:block" />
            <span className="text-muted-foreground hidden sm:block">主控面板</span>
            <span className="text-muted-foreground/50 hidden sm:block">/</span>
            <span className="text-foreground">
              {filteredMenu.find(item => item.path === location.pathname)?.name || '概览'}
            </span>
          </div>

          <div className="flex items-center">
            {/* 状态徽章贴纸 */}
            <div className="flex items-center space-x-2 bg-emerald-500/10 border-2 border-border text-emerald-700 dark:text-emerald-400 px-2 sm:px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider pop-shadow-sm select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block border border-border"></span>
              <span className="hidden sm:inline">核心服务正常 // ONLINE</span>
              <span className="sm:hidden">正常</span>
            </div>
          </div>
        </header>

        {/* 内容主体 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background/20">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
