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
  User,
  Compass
} from 'lucide-react'

// 定义菜单项
interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<any>
  permission?: string
}

const MENU_ITEMS: MenuItem[] = [
  { name: '仪表盘', path: '/', icon: LayoutDashboard }, 
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
    <div className="flex h-screen bg-background elegant-gradient-bg text-foreground font-sans overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-60 border-r border-border bg-sidebar flex flex-col flex-shrink-0 relative z-20">
        
        {/* 顶部 Logo - 优雅杂志感 */}
        <div className="h-16 flex items-center px-6 justify-between border-b border-border/60">
          <Link to="/" className="text-xl font-display font-medium tracking-tight italic text-foreground flex items-center space-x-2">
            <span>Cybermind</span>
            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-muted-foreground/30 text-muted-foreground/80 font-sans rounded-sm not-italic font-bold scale-90">
              CMS
            </span>
          </Link>
        </div>

        {/* 导航菜单 - 圆角滑块风格 */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-secondary text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <Icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* 用户底部面板 - 精致小卡片 */}
        <div className="p-4 border-t border-border/60 bg-sidebar">
          <div className="flex items-center justify-between bg-secondary/30 p-2.5 rounded-xl border border-border/20">
            <div className="flex items-center space-x-2.5 min-w-0">
              {/* 圆形头像 */}
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="truncate text-[11px] leading-tight">
                <p className="font-semibold truncate text-foreground">
                  {user?.nickname || user?.username || '管理员'}
                </p>
                <p className="text-[9px] text-muted-foreground/80 truncate mt-0.5">
                  {user?.roles.includes('super_admin') ? '超级管理员' : '系统操作员'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-transparent hover:bg-secondary text-muted-foreground hover:text-rose-600 transition-all cursor-pointer"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* 顶部简洁工具栏 */}
        <header className="h-16 border-b border-border/60 bg-card/40 backdrop-blur flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <Compass className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-muted-foreground">主控面板</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">
              {filteredMenu.find(item => item.path === location.pathname)?.name || '概览'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-[11px] tracking-wider text-muted-foreground/80">核心节点连接成功</span>
            </div>
          </div>
        </header>

        {/* 内容主体 */}
        <main className="flex-1 overflow-y-auto p-8 bg-background/30">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
