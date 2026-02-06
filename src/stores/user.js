import { ref, computed } from 'vue'
import { usersApi } from '@/api/users.api'
import { useAuthStore } from './auth'

const userProfile = ref(null)
const isLoadingProfile = ref(false)

export function useUserStore() {
  const authStore = useAuthStore()

  const username = computed(() => userProfile.value?.name || userProfile.value?.account || '')
  const email = computed(() => userProfile.value?.email || '')
  const phone_number = computed(() => userProfile.value?.phone_number || '')
  const role = computed(() => userProfile.value?.role ?? 6)
  const position = computed(() => userProfile.value?.position || '')
  const profile = computed(() => userProfile.value)
  const isLoading = computed(() => isLoadingProfile.value)
  // User ID for API calls (user_id in bookings) - from auth store (set during login)
  const userId = computed(() => authStore.getUserId())

  // 獲取用戶資料
  const fetchUserProfile = async () => {
    const userId = authStore.getUserId()
    const token = authStore.getAccessToken()

    if (!userId || !token) {
      userProfile.value = null
      return
    }

    if (isLoadingProfile.value) return

    try {
      isLoadingProfile.value = true

      const response = await usersApi.getProfile(userId)

      if (response.data.success && response.data.data) {
        userProfile.value = response.data.data
      } else {
        userProfile.value = null
      }
    } catch {
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
    email,
    phone_number,
    role,
    profile,
    position,
    userId,
    isLoading,
    fetchUserProfile,
    clearUserProfile,
  }
}
