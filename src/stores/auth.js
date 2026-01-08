import { ref, computed } from 'vue'
import axios from 'axios'

// In-memory storage for access token
const accessToken = ref(null)
const uid = ref(null)

export function useAuthStore() {
  const isLoggedIn = computed(() => !!accessToken.value)

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
        const refreshResult = await refresh()
        console.log('Token refresh result during initialization:', refreshResult)
        if (!refreshResult.success) {
          clearAuth()
        }
      } catch {
        clearAuth()
      }
    }
    console.log('initializeAuth completed. isLoggedIn:', isLoggedIn.value)
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

        return { success: true, data: userData }
      } else {
        return {
          success: false,
          message: response.data.message || '帳號或密碼錯誤',
        }
      }
    } catch (error) {
      console.error('Login error:', error)

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
      console.log(response)

      if (response.data.success) {
        const newToken = response.data.data.accessToken
        accessToken.value = newToken
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
    login,
    refresh,
    redirectToSSO,
  }
}
