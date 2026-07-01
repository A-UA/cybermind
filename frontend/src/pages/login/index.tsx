import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import { ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. 请求登录
      const res = await apiClient.post('/auth/login', { username, password })
      const token = res.data.data.access_token
      setAccessToken(token)

      // 2. 请求当前用户信息
      const userRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(userRes.data.data)

      // 3. 跳转到主页
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background font-sans overflow-hidden">
      {/* 左侧：科技美学点阵背景 (仅桌面端显示) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-card border-r border-border bg-dot-grid relative">
        <div className="flex items-center space-x-2 select-none">
          <span className="text-xl font-bold tracking-tight text-foreground">Cybermind</span>
          <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            CMS
          </span>
        </div>

        <div className="space-y-4 max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-foreground font-sans">
            Minimalist Control
            <br />
            <span className="text-primary">Precision Delivery.</span>
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            专为企业内容管理打造的高性能后台控制台。基于极简网格系统与流式交互，提供秒级内容分发、细粒度 RBAC 权限管理以及多端联动配置。
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 font-mono">
          <span>VERSION 2.0.0</span>
          <span>SYSTEM ACTIVE // SECURE ACCESS</span>
        </div>
      </div>

      {/* 右侧：登录表单区 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-background bg-dot-grid lg:bg-none">
        <div className="w-full max-w-sm space-y-8 animate-scale-in">
          {/* 移动端 Logo 替代方案 */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-2">
            <div className="flex items-center space-x-2 select-none">
              <span className="text-2xl font-bold tracking-tight text-foreground">Cybermind</span>
              <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                CMS
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">企业内容管理控制台</p>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground hidden lg:block">登录控制台</h1>
            <p className="text-[13px] text-muted-foreground hidden lg:block">请输入管理员凭证访问系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 账号 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground font-mono block uppercase">
                USERNAME
              </label>
              <input
                type="text"
                required
                placeholder="请输入账号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-[13px] placeholder-muted-foreground/60 outline-none transition-all focus:border-primary/80 focus:ring-1 focus:ring-primary/80 h-9"
              />
            </div>

            {/* 密码 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-muted-foreground font-mono block uppercase">
                  PASSWORD
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-3 pr-9 py-2 bg-card border border-border rounded-lg text-foreground text-[13px] placeholder-muted-foreground/60 outline-none transition-all focus:border-primary/80 focus:ring-1 focus:ring-primary/80 h-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground font-medium text-[13px] rounded-lg border border-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors h-9 mt-4 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                  <span>正在登录...</span>
                </>
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          {/* 底部版权 */}
          <div className="text-center lg:text-left text-[11px] text-muted-foreground/50 font-mono pt-4 border-t border-border/40">
            CYBERMIND STUDIO © {new Date().getFullYear()} // ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </div>
  )
}
