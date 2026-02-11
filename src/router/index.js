import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'
import IntroductionPage from '../views/IntroductionPage.vue'
import HomePage from '../views/HomePage.vue'
import RecordsView from '../views/RecordsView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import LoginView from '../views/LoginView.vue'
import StatusPage from '../views/StatusPage.vue'
import TeacherSignOff from '../views/TeacherSignOff.vue'
import TASignOff from '../views/TASignOff.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'  // 重定向到首頁
  },
  {
    path: '/borrow', // 借用申請頁
    name: 'BorrowRequest',
    component: BorrowRequestView,
  },
  {
    path: '/introduction', // 介紹頁
    name: 'IntroductionPage',
    component: IntroductionPage,
  },
  {
    path: '/home', // 首頁
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/record', // 借用紀錄
    name: 'RecordsView',
    component: RecordsView,
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
    path: '/borrow-status',
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
  scrollBehavior() {
    // 強制滾動到頂部
    return { top: 0, left: 0 }
  },
})

import { useAuthStore } from '@/stores/auth'

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize (check user login status)
  await authStore.ensureInitialized()

  const publicPages = ['/login', '/', '/introduction', '/home', '/borrow-status']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !authStore.isLoggedIn.value) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

// 強制重置滾動位置
router.afterEach(() => {
  // 立即重置
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
})

export default router
