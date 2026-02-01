import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token getter function - will be set by auth store
let getAccessToken = () => null
let onUnauthorized = () => Promise.resolve(false)
let isRefreshing = false

// Configure auth token getter
export const setAuthTokenGetter = (getter) => {
  getAccessToken = getter
}

// Configure unauthorized handler (for token refresh)
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip retry for refresh endpoint to prevent infinite loop
    const isRefreshRequest = originalRequest.url?.includes('/api/refresh')

    // Handle 401 Unauthorized - attempt token refresh (but not for refresh endpoint itself)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isRefreshing
    ) {
      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshSuccess = await onUnauthorized()
        isRefreshing = false

        if (refreshSuccess) {
          // Retry the original request with new token
          const token = getAccessToken()
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
