import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from '@/api/services/token.service'
import { API_ENDPOINT } from '@/api/services/constants'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URLL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!accessToken,
      })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      if (import.meta.env.DEV) {
        console.log('[API] Access token expired, refreshing...')
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URLL || 'http://localhost:8000'}` +
          API_ENDPOINT.REFRESH,
        {},
        {
          withCredentials: true,
          timeout: 10000,
        }
      )

      const newAccessToken = data.data.access_token

      setAccessToken(newAccessToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      }

      processQueue(null, newAccessToken)

      if (import.meta.env.DEV) {
        console.log('[API] Token refreshed successfully')
      }

      return api(originalRequest)
    } catch (refreshError) {
      if (import.meta.env.DEV) {
        console.error('[API] Token refresh failed:', refreshError)
      }

      processQueue(refreshError as Error, null)

      clearAccessToken()

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
