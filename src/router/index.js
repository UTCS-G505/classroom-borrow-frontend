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

  const publicPages = ['/login', '/', '/introduction', '/home', '/borrow_status']
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

  // 在 DOM 更新後再次重置（確保萬無一失）
  setTimeout(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, 0)

  // 再次確保（針對某些延遲渲染的情況）
  setTimeout(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, 100)
})

export default router
