/** Axios 实例 — 统一请求拦截/响应拦截/Token 刷新 */
import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/admin'

// ---------- 扩展 AxiosRequestConfig ----------
declare module 'axios' {
  interface AxiosRequestConfig {
    /** 标记该请求已经历过一次 401 重试，防止无限循环 */
    _retry?: boolean
    /** 标记该请求不需要在失败时弹 toast（如静默刷新） */
    _silent?: boolean
  }
}

// ---------- 实例创建 ----------

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 携带 Cookie（refresh_token）
})

/** 独立的刷新请求实例（不挂拦截器，避免循环触发） */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

// ---------- 请求拦截器 ----------

apiClient.interceptors.request.use((config) => {
  // 刷新请求不附加 access_token
  if (config.url === '/auth/refresh') return config

  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------- Token 刷新队列 ----------

/** 排队中的请求，统一用 { resolve, reject } 对管理 */
interface PendingRequest {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let pendingQueue: PendingRequest[] = []

/** 刷新成功 — 释放所有排队请求 */
function flushQueue(token: string) {
  pendingQueue.forEach(({ resolve }) => resolve(token))
  pendingQueue = []
}

/** 刷新失败 — 拒绝所有排队请求 */
function rejectQueue(error: unknown) {
  pendingQueue.forEach(({ reject }) => reject(error))
  pendingQueue = []
}

// ---------- 不参与 Token 刷新的路径 ----------

/** 这些接口的 401 属于业务含义（如登录密码错误），不应触发刷新流程 */
const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/refresh']

function shouldSkipRefresh(config?: AxiosRequestConfig): boolean {
  return SKIP_REFRESH_PATHS.some((path) => config?.url?.endsWith(path))
}

// ---------- 响应拦截器 ----------

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig | undefined = error.config
    const status = error.response?.status as number | undefined

    // ---- 1. 判断是否需要走 Token 刷新流程 ----
    const needsRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest)

    if (!needsRefresh) {
      // 非刷新场景：弹 toast 提示用户（除非标记了 _silent）
      if (!originalRequest?._silent) {
        toast.error(getApiErrorMessage(error, '请求失败，请稍后重试'))
      }
      return Promise.reject(error)
    }

    // ---- 2. 如果已有刷新请求在飞，排队等待 ----
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest!.headers = {
          ...originalRequest!.headers,
          Authorization: `Bearer ${newToken}`,
        }
        return apiClient(originalRequest!)
      })
    }

    // ---- 3. 发起 Token 刷新 ----
    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await refreshClient.post('/auth/refresh')
      const newToken = data.data.access_token as string

      useAuthStore.getState().setAccessToken(newToken)
      flushQueue(newToken)

      // 重试原始请求
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      }
      return apiClient(originalRequest)
    } catch (refreshError) {
      // 刷新失败：拒绝排队请求 → 清除认证状态 → 通知应用跳转登录
      rejectQueue(refreshError)
      useAuthStore.getState().logout()
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient

// ---------- 工具函数 ----------

/**
 * 从 Axios 错误中提取后端返回的 message 字段。
 * 使用 `isAxiosError` 类型守卫，避免手动 `as` 断言。
 */
export function getApiErrorMessage(err: unknown, fallbackMsg = '操作失败'): string {
  if (isAxiosError(err)) {
    return err.response?.data?.message || fallbackMsg
  }
  if (err instanceof Error) {
    return err.message || fallbackMsg
  }
  return fallbackMsg
}
