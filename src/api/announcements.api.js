import apiClient from './axios'

/**
 * Announcements API Module
 * Handles announcement-related API calls
 */
export const announcementsApi = {
  /**
   * Get all announcements
   * @returns {Promise} Response with array of announcements
   * @example
   * // Response format:
   * // [
   * //   {
   * //     announcement_id: 2,
   * //     title: "防疫注意事項",
   * //     content: "進入教室請配戴口罩並完成手部消毒。",
   * //     created_at: "2025-11-29T16:27:57.000Z",
   * //     expired_at: null
   * //   }
   * // ]
   */
  getAllAnnouncements: () => {
    return apiClient.get('/announcements/')
  },

  /**
   * Get a specific announcement by ID
   * @param {number} id - Announcement ID
   * @returns {Promise} Response with announcement details
   */
  getAnnouncementById: (id) => {
    return apiClient.get(`/announcements/${id}`)
  },

  /**
   * Create a new announcement (Admin)
   * @param {Object} data - Announcement data
   * @returns {Promise} Response with created announcement
   */
  createAnnouncement: (data) => {
    return apiClient.post('/announcements', data)
  },

  /**
   * Update an existing announcement (Admin)
   * @param {number} id - Announcement ID
   * @param {Object} data - Updated announcement data
   * @returns {Promise} Response with updated announcement
   */
  updateAnnouncement: (id, data) => {
    return apiClient.put(`/announcements/${id}`, data)
  },

  /**
   * Delete an announcement (Admin)
   * @param {number} id - Announcement ID
   * @returns {Promise} Response confirming deletion
   */
  deleteAnnouncement: (id) => {
    return apiClient.delete(`/announcements/${id}`)
  },
}

export default announcementsApi
