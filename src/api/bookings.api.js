import apiClient from './axios'

/**
 * Bookings API Module
 * Handles booking/reservation-related API calls
 */
export const bookingsApi = {
  /**
   * Get user's own booking requests
   * @param {number} userId - User ID
   * @returns {Promise} Response with array of booking requests
   */
  getMyBookings: (userId) => {
    return apiClient.get('/bookings/', {
      params: { id: userId },
    })
  },

  /**
   * Get a specific booking by ID
   * @param {number} id - Booking request ID
   * @returns {Promise} Response with booking details
   */
  getBookingById: (id) => {
    return apiClient.get(`/bookings/${id}`)
  },

  /**
   * Create a new booking request
   * @param {Object} bookingData - Booking request data
   * @param {string} bookingData.user_id - User ID
   * @param {string} bookingData.classroom_id - Classroom ID (e.g., "C102")
   * @param {string} bookingData.borrow_type - Borrow type ("單次借用" or "多次借用")
   * @param {string} bookingData.start_date - Start date (YYYY-MM-DD)
   * @param {string} [bookingData.end_date] - End date for multi-day bookings
   * @param {string} bookingData.start_time - Start time (HH:MM)
   * @param {string} bookingData.end_time - End time (HH:MM)
   * @param {string} bookingData.event_name - Event/activity name
   * @param {number} bookingData.people_count - Number of participants
   * @param {string} bookingData.teacher_name - Supervising teacher name
   * @param {string} bookingData.reason - Reason for booking
   * @param {string} [bookingData.teacher_department] - Teacher's department
   * @param {string} [bookingData.teacher_phone] - Teacher's phone
   * @param {string} [bookingData.teacher_email] - Teacher's email
   * @param {string} [bookingData.borrower_department] - Borrower's department
   * @param {string} [bookingData.borrower_phone] - Borrower's phone
   * @param {string} [bookingData.borrower_email] - Borrower's email
   * @returns {Promise} Response with message and request_id
   */
  createBooking: (bookingData) => {
    console.log('Creating booking with data:', bookingData)
    return apiClient.post('/bookings/', bookingData)
  },

  /**
   * Cancel a booking request
   * @param {number} id - Booking request ID
   * @returns {Promise} Response with message and request_id
   */
  cancelBooking: (id) => {
    return apiClient.put(`/bookings/${id}/cancel`)
  },

  /**
   * Return/complete a booking (mark classroom as returned)
   * @param {number} id - Booking request ID
   * @returns {Promise} Response with message and request_id
   */
  returnBooking: (id) => {
    return apiClient.put(`/bookings/${id}/return`)
  },
}

export default bookingsApi
