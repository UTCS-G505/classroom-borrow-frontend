import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

const currentUsername = ref('')
const isLoadingProfile = ref(false)

export function useUserStore() {
  const authStore = useAuthStore()

  const username = computed(() => currentUsername.value)
  const isLoading = computed(() => isLoadingProfile.value)

  // 獲取用戶資料
  const fetchUserProfile = async () => {
    const uid = authStore.getUid()
    const token = authStore.getAccessToken()

    if (!uid || !token) {
      currentUsername.value = ''
      return
    }

    if (isLoadingProfile.value) return

    try {
      isLoadingProfile.value = true
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      const response = await axios.get(`${API_URL}/users/profile`, {
        params: { uid },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success && response.data.data) {
        currentUsername.value = response.data.data.name || response.data.data.account
      } else {
        currentUsername.value = ''
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      currentUsername.value = ''
    } finally {
      isLoadingProfile.value = false
    }
  }

  const clearUserProfile = () => {
    currentUsername.value = ''
  }

  return {
    username,
    isLoading,
    fetchUserProfile,
    clearUserProfile,
  }
}
