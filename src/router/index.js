import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'
import introductionPage from '../views/introductionPage.vue'
import HomePage from '../views/HomePage.vue'
<<<<<<< HEAD
import LoginView from '@/views/LoginView.vue'
=======
import recordsView from '../views/recordsView.vue'
>>>>>>> 5d9d6f8f6db628ba9b82fd9719182c248d49788b

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
    path: '/home', // 首頁
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/', // 首頁(根目錄)
    name: 'HomePage_root',
    component: HomePage,
  },
  {
<<<<<<< HEAD
    path: '/login', // 登入
    name: 'Login',
    component: LoginView,
=======
    path: '/record', // 借用紀錄
    name: 'RecordsView',
    component: recordsView,
>>>>>>> 5d9d6f8f6db628ba9b82fd9719182c248d49788b
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
