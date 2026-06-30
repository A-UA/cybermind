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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background bg-noise font-sans overflow-hidden px-4">
      {/* 登录卡片 */}
      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="bg-card rounded-2xl elevation-4 p-8 sm:p-10">
          {/* Logo & 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading text-foreground tracking-tight">
              Cybermind
            </h1>
            <div className="h-[2px] w-12 bg-primary mx-auto my-3 rounded-full" />
            <p className="text-[12px] text-muted-foreground">
              内容管理控制台
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 账号 */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground block">
                登录账号
              </label>
              <input
                type="text"
                required
                placeholder="请输入账号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-[13px] placeholder-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* 密码 */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground block">
                登录密码
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-4 pr-10 py-2.5 bg-background border border-border rounded-xl text-foreground text-[13px] placeholder-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-primary text-primary-foreground font-semibold text-[13px] rounded-xl elevation-1 hover:elevation-2 hover-lift flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </>
              )}
            </button>
          </form>

          {/* 底部版权 */}
          <div className="mt-8 text-center text-[11px] text-muted-foreground">
            Cybermind Studio © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
