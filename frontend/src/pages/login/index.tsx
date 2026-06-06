import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
      setError(err.response?.data?.message || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 to-black overflow-hidden font-sans">
      {/* 渐变装饰背景球 */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />

      {/* Glassmorphism 卡片 */}
      <div className="relative w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CyberMind CMS
          </h1>
          <p className="text-sm text-slate-400 mt-2">智能企业后台内容管理系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-200 border border-red-500/30 bg-red-500/10 rounded-lg animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              登录账号
            </label>
            <input
              type="text"
              required
              placeholder="请输入账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-950/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              密码
            </label>
            <input
              type="password"
              required
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-950/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? '登录中...' : '立即登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
