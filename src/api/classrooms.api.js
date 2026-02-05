import apiClient from './axios'

/**
 * Classrooms API Module
 * Handles classroom-related API calls
 */
export const classroomsApi = {
  /**
   * Get all classrooms
   * @returns {Promise} Response with array of classrooms
   */
  getAllClassrooms: () => {
    return apiClient.get('/classrooms/')
  },

  /**
   * Get a specific classroom by ID
   * @param {string} id - Classroom ID (e.g., "C101")
   * @returns {Promise} Response with classroom details
   */
  getClassroomById: (id) => {
    return apiClient.get(`/classrooms/${id}`)
  },

  /**
   * Create a new classroom (admin only)
   * @param {Object} classroomData - Classroom data
   * @param {string} classroomData.role - User role (must be "admin")
   * @param {string} classroomData.classroom_id - Classroom ID
   * @param {string} classroomData.name - Classroom name
   * @param {string} classroomData.type - Classroom type (e.g., "一般教室", "音樂教室")
   * @param {number} classroomData.capacity - Maximum capacity
   * @param {string} [classroomData.description] - Description of facilities
   * @param {string} [classroomData.image_url] - Image URL
   * @returns {Promise} Response with message
   */
  createClassroom: (classroomData) => {
    return apiClient.post('/classrooms/', classroomData)
  },

  /**
   * Update a classroom (admin only)
   * @param {string} id - Classroom ID
   * @param {Object} classroomData - Updated classroom data
   * @param {string} [classroomData.name] - Classroom name
   * @param {string} [classroomData.type] - Classroom type
   * @param {number} [classroomData.capacity] - Maximum capacity
   * @param {string} [classroomData.description] - Description
   * @param {string} [classroomData.image_url] - Image URL
   * @returns {Promise} Response with message
   */
  updateClassroom: (id, classroomData) => {
    return apiClient.put(`/classrooms/${id}`, classroomData)
  },

  /**
   * Delete a classroom (admin only)
   * @param {string} id - Classroom ID
   * @returns {Promise} Response with message
   */
  deleteClassroom: (id) => {
    return apiClient.delete(`/classrooms/${id}`)
  },
}

export default classroomsApi
