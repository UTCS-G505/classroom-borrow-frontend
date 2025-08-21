import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'
import introductionPage from '../views/introductionPage.vue'
<<<<<<< HEAD
import LoginView from '../views/LoginView.vue'
=======
import HomePage from '../views/HomePage.vue'
>>>>>>> b55299bcfe28918c5c6b3bee4632ca81eea8dfb1

const routes = [
  {
    path: '/borrow', // 你的網址
    name: 'BorrowRequest',
    component: BorrowRequestView,
  },
  {
    path: '/introduction', // 你的網址
    name: 'introductionPage',
    component: introductionPage,
  },
  {
<<<<<<< HEAD
    path: '/login', // 你的網址
    name: 'LoginView',
    component: LoginView,
=======
    path: '/home', // 首頁
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/', // 首頁(根目錄)
    name: 'HomePage_root',
    component: HomePage,
>>>>>>> b55299bcfe28918c5c6b3bee4632ca81eea8dfb1
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如返回上一頁），滾動到保存的位置
    if (savedPosition) {
      return savedPosition
    } else {
      // 否則滾動到頁面頂部
      return { top: 0 }
    }
  },
})

export default router
