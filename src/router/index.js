import { createRouter, createWebHistory } from 'vue-router'

import login from '../views/login.vue'

const routes = [
  {
    path: '/login', // 你的網址
    name: 'LogIn',
    component: login,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router