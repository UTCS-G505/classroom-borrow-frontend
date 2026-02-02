import api from './axios'

// Get all announcements
export const getAnnouncements = () => {
  return api.get('/announcements')
}

// Get single announcement
export const getAnnouncementById = (id) => {
  return api.get(`/announcements/${id}`)
}

// Create announcement (Admin)
export const createAnnouncement = (data) => {
  return api.post('/announcements', data)
}

// Update announcement (Admin)
export const updateAnnouncement = (id, data) => {
  return api.put(`/announcements/${id}`, data)
}

// Delete announcement (Admin)
export const deleteAnnouncement = (id) => {
  return api.delete(`/announcements/${id}`)
}
