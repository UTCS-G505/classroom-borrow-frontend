import { createRouter, createWebHistory } from 'vue-router'

import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  {
    path: '/admin', // 你的網址
    name: 'AdminDashboard',
    component: AdminDashboard,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router