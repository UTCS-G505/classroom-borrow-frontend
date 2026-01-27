import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'
import introductionPage from '../views/introductionPage.vue'
import HomePage from '../views/HomePage.vue'
import recordsView from '../views/recordsView.vue'
import LoginView from '../views/LoginView.vue'
import StatusPage from '../views/StatusPage.vue'
import TeacherSignoffView from '../views/TeacherSignoffView.vue'
import TASignoffView from '../views/TASignoffView.vue'

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
    path: '/record', // 借用紀錄
    name: 'RecordsView',
    component: recordsView,
  },
  {
    path: '/login', // 你的網址
    name: 'LoginView',
    component: LoginView,
  },
  {
    path: '/borrow_status', // 教室使用情況
    name: 'StatusPage',
    component: StatusPage,
  },
  {
    path: '/teacher-signoff',
    name: 'TeacherSignoff',
    component: TeacherSignoffView,
  },
  {
    path: '/ta-signoff',
    name: 'TASignoff',
    component: TASignoffView,
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
