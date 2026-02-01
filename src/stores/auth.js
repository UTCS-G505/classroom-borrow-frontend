import { ref, computed } from 'vue'
import { getJwtExp } from '../utils/getJWTExp.js'
import { authApi } from '@/api/auth.api'
import { setAuthTokenGetter, setUnauthorizedHandler } from '@/api/axios'

// In-memory storage for access token
const accessToken = ref(null)
const user_id = ref(null) // Unified user_id (SSO UID)
const refreshTimerId = ref(null)
const isRefreshing = ref(false)
let interceptorsInitialized = false

// Initialize interceptors once (outside the composable)
const initializeInterceptors = (refreshFn) => {
  if (interceptorsInitialized) return
  interceptorsInitialized = true

  setAuthTokenGetter(() => accessToken.value)
  setUnauthorizedHandler(async () => {
    if (isRefreshing.value) return false
    const result = await refreshFn()
    return result.success
  })
}

export function useAuthStore() {
  const isLoggedIn = computed(() => !!accessToken.value && !!user_id.value)

  const setAuth = (token, idValue) => {
    accessToken.value = token
    user_id.value = idValue

    // Store user_id in localStorage for persistence
    if (idValue) {
      localStorage.setItem('user_id', idValue)
    }
  }

  const setUser = (newUser) => {
    user.value = newUser
  }

  const clearAuth = () => {
    accessToken.value = null
    user_id.value = null
    localStorage.removeItem('user_id')
    // Clear legacy keys if they exist
    localStorage.removeItem('uid')
    localStorage.removeItem('userId')

    if (refreshTimerId.value) {
      clearTimeout(refreshTimerId.value)
      refreshTimerId.value = null
    }
  }

  const getAccessToken = () => {
    return accessToken.value
  }

  const getUserId = () => {
    return user_id.value
  }

  const refresh = async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshing.value) {
      return { success: false, message: 'Refresh already in progress' }
    }

    isRefreshing.value = true

    try {
      const response = await authApi.refresh()

      if (response.data.success) {
        const newToken = response.data.data.accessToken
        accessToken.value = newToken

        // Restore user_id from localStorage if not already set
        if (!user_id.value) {
          const storedId = localStorage.getItem('user_id')
          if (storedId) {
            user_id.value = storedId
          } else {
            // Fallback for migration from old keys
            const oldUid = localStorage.getItem('uid')
            if (oldUid) user_id.value = oldUid
          }
        }

        scheduleTokenRefresh()
        console.log('Token refreshed successfully')
        return { success: true }
      } else {
        clearAuth()
        return { success: false, message: 'Token 刷新失敗' }
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuth()
      return { success: false, message: '發生未預期的錯誤' }
    } finally {
      isRefreshing.value = false
    }
  }

  // Initialize interceptors with refresh function
  initializeInterceptors(refresh)

  const initializeAuth = async () => {
    if (!accessToken.value) {
      // Try to load user_id from localStorage
      const storedId = localStorage.getItem('user_id') || localStorage.getItem('uid')
      if (storedId) {
        user_id.value = storedId
      }

      try {
        console.log('Initializing auth by refreshing token...')
        const refreshResult = await refresh()
        if (!refreshResult.success) {
          clearAuth()
        }
      } catch {
        clearAuth()
      }
    }
  }

  const scheduleTokenRefresh = () => {
    // Clear any previous timer
    if (refreshTimerId.value) {
      clearTimeout(refreshTimerId.value)
      refreshTimerId.value = null
    }

    if (!accessToken.value) return

    const BUFFER_MS = 60 * 1000 // 1 minute
    const DEFAULT_DELAY_MS = 9 * 60 * 1000 // 9 minutes if no exp available

    const exp = getJwtExp(accessToken.value)
    let delay = DEFAULT_DELAY_MS
    if (exp) {
      const msUntilExp = exp * 1000 - Date.now()
      delay = Math.max(10000, msUntilExp - BUFFER_MS) // Minimum 10 seconds delay
    }

    refreshTimerId.value = window.setTimeout(() => {
      refresh().catch(() => { })
    }, delay)
  }

  const login = async (account, password) => {
    try {
      const response = await authApi.login(account, password)

      if (response.data.success) {
        const userData = response.data.data
        const token = userData.accessToken
        // Use user_id from response (or uid, they are same now)
        const idValue = userData.user?.user_id || userData.uid

        // Store auth data in memory
        setAuth(token, idValue)
        scheduleTokenRefresh()

        return { success: true, data: userData }
      } else {
        return {
          success: false,
          message: response.data.message || '帳號或密碼錯誤',
        }
      }
    } catch (error) {
      let errorMessage = '發生未預期的錯誤'

      if (error.code === 'ERR_NETWORK') {
        errorMessage = '無法連線到伺服器，請確認後端是否已啟動'
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data.message || '登入失敗'
      }

      return { success: false, message: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local auth state regardless of API response
      clearAuth()
    }
  }

  const redirectToSSO = () => {
    const SSO_URL = import.meta.env.VITE_SSO_URL || 'http://localhost:8080'
    window.location.href = SSO_URL
  }

  return {
    accessToken: computed(() => accessToken.value),
    user_id: computed(() => user_id.value),
    isLoggedIn,
    setAuth,
    clearAuth,
    getAccessToken,
    getUserId,
    initializeAuth,
    scheduleTokenRefresh,
    login,
    logout,
    refresh,
    redirectToSSO,
  }
}
