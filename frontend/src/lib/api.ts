/** Axios 实例 — 统一请求拦截/响应拦截/Token 刷新 */
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin'

// 扩展 AxiosRequestConfig 类型，添加 _retry 标记
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 携带 Cookie（refresh_token）
})

// 独立的刷新请求实例（不带拦截器，避免循环触发）
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

// 请求拦截器：自动附加 Authorization 头（跳过刷新请求）
apiClient.interceptors.request.use((config) => {
  // 刷新请求不附加 token
  if (config.url === '/auth/refresh') {
    return config
  }
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 自动刷新 Token
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []
let refreshRejecters: ((error: unknown) => void)[] = []

function subscribeTokenRefresh(resolve: (token: string) => void, reject: (error: unknown) => void) {
  refreshSubscribers.push(resolve)
  refreshRejecters.push(reject)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
  refreshRejecters = []
}

function onTokenRefreshFailed(error: unknown) {
  refreshRejecters.forEach((cb) => cb(error))
  refreshSubscribers = []
  refreshRejecters = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 非 401 错误或刷新请求本身失败，直接抛出
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // 如果正在刷新，排队等待
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          },
          (refreshError) => reject(refreshError),
        )
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // 使用独立实例发起刷新请求（不经过拦截器）
      const { data } = await refreshClient.post('/auth/refresh')
      const newToken = data.data.access_token as string
      useAuthStore.getState().setAccessToken(newToken)
      onTokenRefreshed(newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      // 刷新失败：拒绝所有排队请求，清除状态，通知应用跳转登录
      onTokenRefreshFailed(refreshError)
      useAuthStore.getState().logout()
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient

/**
 * 统一 API 错误解析并 Toast 反馈
 * 从 Axios 响应中提取后端 message 字段，如无则使用 fallback 兜底文案。
 */
export function getApiErrorMessage(err: unknown, fallbackMsg = '操作失败'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response
    return resp?.data?.message || fallbackMsg
  }
  return fallbackMsg
}
