import { createRouter, createWebHistory } from 'vue-router'

import introductionPage from '../views/introductionPage.vue'

const routes = [
  {
    path: '/introduction',   // 你的網址
    name: 'introductionPage',
    component: introductionPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router