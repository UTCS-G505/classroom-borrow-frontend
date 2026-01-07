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

  const initializeAuth = () => {
    // Try to restore uid from localStorage on app start
    const storedUid = localStorage.getItem('uid')
    if (storedUid) {
      uid.value = storedUid
      // Note: accessToken is not persisted for security reasons
      // User will need to re-login if page is refreshed
    }
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

        // console.log('SSO 登入成功:', response.data)
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
    redirectToSSO,
  }
}
