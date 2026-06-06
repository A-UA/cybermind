import React, { useState } from 'react'
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background pop-brutal-bg font-sans overflow-hidden px-4">
      {/* 极富冲击力的新野兽派实体拼贴卡片 */}
      <div className="relative w-full max-w-md p-8 bg-card border-2 border-border pop-shadow rounded-xl transition-all duration-300">
        
        {/* 彩色装饰角标贴纸 */}
        <div className="absolute -top-3 -left-3 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-wider border-2 border-border rounded-lg pop-shadow-sm rotate-[-3deg]">
          OPERATOR PORTAL
        </div>

        {/* 标题 */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-5xl font-heading font-bold tracking-tight text-foreground select-none">
            Cybermind
          </h1>
          <div className="h-1.5 w-24 bg-primary border-t border-b border-border mx-auto my-3" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Pop Content Workspace // 管理控制台
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 text-xs text-destructive border-2 border-destructive bg-destructive/5 rounded-lg flex items-start space-x-2 animate-shake font-semibold">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <span>系统提示:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 操作员账号 */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
              操作员账号 / USERNAME
            </label>
            <input
              type="text"
              required
              placeholder="请输入登录账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all text-xs rounded-lg text-foreground placeholder-muted-foreground outline-none font-medium"
            />
          </div>

          {/* 访问密码 */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
              安全访问密钥 / PASSCODE
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="请输入访问密钥"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-background border-2 border-border focus:bg-accent/40 transition-all text-xs rounded-lg text-foreground placeholder-muted-foreground outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 物理下沉登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-primary text-primary-foreground font-heading font-bold text-xs tracking-wider rounded-lg border-2 border-border pop-shadow-sm pop-press flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{loading ? '正在建立安全会话...' : '进入工作空间 ENTER'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* 底部版权 */}
        <div className="mt-8 text-center text-[10px] text-muted-foreground font-semibold tracking-wider font-mono">
          CYBERMIND STUDIO © 2026 // ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  )
}
