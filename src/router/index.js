import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'

const routes = [
  {
    path: '/borrow',   // 你的網址
    name: 'BorrowRequest',
    component: BorrowRequestView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router