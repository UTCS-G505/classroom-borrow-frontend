/**
 * API Module Index
 * Centralized exports for all API modules
 */

export { default as apiClient } from './axios'
export { setAuthTokenGetter, setUnauthorizedHandler } from './axios'

export { authApi } from './auth.api'
export { bookingsApi } from './bookings.api'
export { classroomsApi } from './classrooms.api'
export { scheduleApi } from './schedule.api'
export { announcementsApi } from './announcements.api'
export { adminApi } from './admin.api'
export { usersApi } from './users.api'

// Default export with all APIs
export default {
  auth: () => import('./auth.api').then((m) => m.authApi),
  bookings: () => import('./bookings.api').then((m) => m.bookingsApi),
  classrooms: () => import('./classrooms.api').then((m) => m.classroomsApi),
  schedule: () => import('./schedule.api').then((m) => m.scheduleApi),
  announcements: () => import('./announcements.api').then((m) => m.announcementsApi),
  admin: () => import('./admin.api').then((m) => m.adminApi),
  users: () => import('./users.api').then((m) => m.usersApi),
}
