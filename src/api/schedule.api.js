import apiClient from './axios'

/**
 * Schedule API Module
 * Handles classroom schedule-related API calls
 */
export const scheduleApi = {
  /**
   * Get schedule for a specific classroom on a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} classroomId - Classroom ID (e.g., "C101")
   * @returns {Promise} Response with array of schedule entries
   * @example
   * // Response format:
   * // [
   * //   {
   * //     schedule_id: 1,
   * //     classroom_id: "C101",
   * //     date: "2025-11-20T00:00:00.000Z",
   * //     time_slot: "09:00-11:00",
   * //     booked_by: 4,
   * //     borrow_request_id: 2,
   * //     event_name: "英文戲劇社演出",
   * //     status: "已預約"
   * //   }
   * // ]
   */
  getClassroomSchedule: (date, classroomId) => {
    return apiClient.get('/bookings/schedule/', {
      params: {
        date,
        classroom_id: classroomId,
      },
    })
  },

  /**
   * Get schedule for a classroom for a date range
   * Helper function that makes multiple API calls for a date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {string} classroomId - Classroom ID
   * @returns {Promise} Response with combined schedule entries
   */
  getClassroomScheduleRange: (startDate, endDate, classroomId) => {
    return apiClient.get('/bookings/schedule/', {
      params: {
        start_date: startDate,
        end_date: endDate,
        classroom_id: classroomId,
      },
    })
  },
}

export default scheduleApi
