import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'
import introductionPage from '../views/introductionPage.vue'
import HomePage from '../views/HomePage.vue'
import recordsView from '../views/recordsView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import LoginView from '../views/LoginView.vue'
import StatusPage from '../views/StatusPage.vue'
import TeacherSignOff from '../views/TeacherSignOff.vue'
import TASignOff from '../views/TASignOff.vue'

const routes = [
  {
    path: '/borrow', // 借用申請頁
    name: 'BorrowRequest',
    component: BorrowRequestView,
  },
  {
    path: '/introduction', // 介紹頁
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
    path: '/admin', // 借用管理頁面
    name: 'AdminDashboard',
    component: AdminDashboard,
  },
  {
    path: '/login', // 登入頁
    name: 'LoginView',
    component: LoginView,
  },
  {
    path: '/borrow_status',
    name: 'StatusPage',
    component: StatusPage,
  },
  {
    path: '/teacher-signoff',
    name: 'TeacherSignOff',
    component: TeacherSignOff,
  },
  {
    path: '/ta-signoff',
    name: 'TASignOff',
    component: TASignOff,
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

import { useAuthStore } from '@/stores/auth'

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize (check user login status)
  await authStore.ensureInitialized()

  const publicPages = ['/login', '/', '/introduction', '/home']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !authStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router
