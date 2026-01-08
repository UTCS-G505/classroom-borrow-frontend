import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

const userProfile = ref(null)
const isLoadingProfile = ref(false)

export function useUserStore() {
  const authStore = useAuthStore()

  const username = computed(() => userProfile.value?.name || userProfile.value?.account || '')
  const primary_email = computed(() => userProfile.value?.primary_email || '')
  const phone_number = computed(() => userProfile.value?.phone_number || '')
  const role = computed(() => userProfile.value?.role || '')
  const position = computed(() => userProfile.value?.position || '')
  const profile = computed(() => userProfile.value)
  const isLoading = computed(() => isLoadingProfile.value)

  // 獲取用戶資料
  const fetchUserProfile = async () => {
    const uid = authStore.getUid()
    const token = authStore.getAccessToken()

    if (!uid || !token) {
      userProfile.value = null
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
        userProfile.value = response.data.data
      } else {
        userProfile.value = null
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      userProfile.value = null
    } finally {
      isLoadingProfile.value = false
    }
  }

  const clearUserProfile = () => {
    userProfile.value = null
  }

  return {
    username,
    primary_email,
    phone_number,
    role,
    profile,
    position,
    isLoading,
    fetchUserProfile,
    clearUserProfile,
  }
}
