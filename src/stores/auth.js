import { ref, computed } from 'vue'
import axios from 'axios'
import { getJwtExp } from '../utils/getJWTExp.js'

// In-memory storage for access token
const accessToken = ref(null)
const uid = ref(null)
const refreshTimerId = ref(null)

export function useAuthStore() {
  const isLoggedIn = computed(() => !!accessToken.value && !!uid.value)

  const setAuth = (token, userId) => {
    accessToken.value = token
    uid.value = userId
    // Also store uid in localStorage for persistence
    if (userId) {
      localStorage.setItem('uid', userId)
    }
  }

  const clearAuth = () => {
    accessToken.value = null
    uid.value = null
    localStorage.removeItem('uid')
  }

  const getAccessToken = () => {
    return accessToken.value
  }

  const getUid = () => {
    return uid.value
  }

  const initializeAuth = async () => {
    if (!accessToken.value) {
      // Try to load uid from localStorage
      const storedUid = localStorage.getItem('uid')
      if (storedUid) {
        uid.value = storedUid
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
      delay = Math.max(0, msUntilExp - BUFFER_MS)
    }

    // If already expired or very close, refresh immediately
    if (delay === 0) {
      // Small microtask delay to avoid recursive call issues
      refresh().catch(() => {})
      return
    }

    refreshTimerId.value = window.setTimeout(() => {
      refresh().catch(() => {})
    }, delay)
  }

  const login = async (account, password) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    try {
      const response = await axios.post(
        API_URL + '/api/login',
        {
          account,
          password,
        },
        { withCredentials: true },
      )

      if (response.data.success) {
        const userData = response.data.data
        const userUid = userData.uid
        const token = userData.accessToken

        // Store auth data in memory
        setAuth(token, userUid)
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

  const refresh = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    try {
      const response = await axios.post(API_URL + '/api/refresh', {}, { withCredentials: true })

      if (response.data.success) {
        const newToken = response.data.data.accessToken
        accessToken.value = newToken

        // Restore uid from localStorage if not already set
        if (!uid.value) {
          const storedUid = localStorage.getItem('uid')
          if (storedUid) {
            uid.value = storedUid
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
    }
  }

  const redirectToSSO = () => {
    const SSO_URL = import.meta.env.VITE_SSO_URL || 'http://localhost:8080'
    window.location.href = SSO_URL
  }

  return {
    accessToken: computed(() => accessToken.value),
    uid: computed(() => uid.value),
    isLoggedIn,
    setAuth,
    clearAuth,
    getAccessToken,
    getUid,
    initializeAuth,
    scheduleTokenRefresh,
    login,
    refresh,
    redirectToSSO,
  }
}
