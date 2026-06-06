import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import { ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 允许用户使用亮色/暗色，这里默认设置为跟随系统或者跟随 shadcn 切换
    // 我们可以直接支持自适应，不强行 classList.add('dark')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
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
    } catch (err: any) {
      setError(err.response?.data?.message || '身份验证未通过，请检查操作员凭证')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background elegant-gradient-bg font-sans overflow-hidden">
      
      {/* 柔和的大圆模糊光圈装饰 */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* 极简卡片容器 */}
      <div className="relative w-full max-w-md p-8 bg-card border border-border/60 elegant-shadow rounded-2xl transition-all duration-300">
        
        {/* 高端画廊标题部 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-medium tracking-tight text-foreground italic">
            Cybermind
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2.5">
            Elegant Content Workspace // 优雅工作台
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/10 bg-rose-500/5 rounded-lg flex items-start space-x-2 animate-shake">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">系统提示:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 操作员账号 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              操作员账号
            </label>
            <input
              type="text"
              required
              placeholder="请输入登录账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/20 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all text-xs rounded-xl text-foreground placeholder-muted-foreground/60 outline-none"
            />
          </div>

          {/* 访问密码 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                安全访问密钥
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="请输入访问密钥"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-secondary/30 border border-transparent focus:border-primary/20 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all text-xs rounded-xl text-foreground placeholder-muted-foreground/60 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#111622] hover:bg-[#1e2536] dark:bg-[#e2e8f0] dark:hover:bg-[#f3f4f6] text-white dark:text-black font-semibold text-xs tracking-wider rounded-xl focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>{loading ? '正在建立安全会话...' : '进入工作空间'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* 底部版权 */}
        <div className="mt-10 text-center text-[9px] text-muted-foreground/50 tracking-wider">
          CYBERMIND STUDIO © 2026 // ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  )
}
