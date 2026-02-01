import apiClient from './axios'

/**
 * Admin API Module
 * Handles admin-only API calls for managing bookings, announcements, and blacklist
 */
export const adminApi = {
  // ===== Booking Management =====

  /**
   * Get all booking requests (admin only)
   * @returns {Promise} Response with array of all booking requests
   */
  getAllBookings: () => {
    return apiClient.get('/admin/bookings')
  },

  /**
   * Update booking status (approve/reject)
   * @param {number} id - Booking request ID
   * @param {Object} statusData - Status update data
   * @param {string} statusData.status - New status ("approved" or "rejected")
   * @param {string} [statusData.reject_reason] - Reason for rejection (required if rejecting)
   * @returns {Promise} Response with message and request_id
   */
  updateBookingStatus: (id, statusData) => {
    return apiClient.put(`/admin/bookings/${id}/status`, statusData)
  },

  // ===== Announcement Management =====

  /**
   * Create a new announcement (admin only)
   * @param {Object} announcementData - Announcement data
   * @param {string} announcementData.title - Announcement title
   * @param {string} announcementData.content - Announcement content
   * @param {string} [announcementData.expired_at] - Expiration date (YYYY-MM-DD)
   * @returns {Promise} Response with message and request_id
   */
  createAnnouncement: (announcementData) => {
    return apiClient.post('/admin/announcements', announcementData)
  },

  // ===== Blacklist Management =====

  /**
   * Add a user to the blacklist (admin only)
   * @param {Object} blacklistData - Blacklist entry data
   * @param {string} blacklistData.user_id - User ID to blacklist
   * @param {string} blacklistData.reason - Reason for blacklisting
   * @param {string} [blacklistData.expired_at] - Expiration date (YYYY-MM-DD)
   * @returns {Promise} Response with message and request_id
   */
  addToBlacklist: (blacklistData) => {
    return apiClient.post('/admin/blacklist', blacklistData)
  },

  /**
   * Remove a user from the blacklist (admin only)
   * @param {string} userId - User ID to remove from blacklist
   * @returns {Promise} Response with message and request_id
   */
  removeFromBlacklist: (userId) => {
    return apiClient.delete(`/admin/blacklist/${userId}`)
  },
}

export default adminApi
