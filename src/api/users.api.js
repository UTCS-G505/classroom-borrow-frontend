import apiClient from './axios'

/**
 * Users API Module
 * Handles user profile-related API calls
 */
export const usersApi = {
  /**
   * Get user profile
   * @param {string|number} uid - User ID
   * @returns {Promise} Response with user profile data
   */
  getProfile: (uid) => {
    return apiClient.get('/users/profile', {
      params: { uid },
    })
  },
}

export default usersApi
