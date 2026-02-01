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
}

export default announcementsApi
