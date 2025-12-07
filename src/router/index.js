import { createRouter, createWebHistory } from 'vue-router'

import BorrowRequestView from '../views/BorrowRequestView.vue'
import introductionPage from '../views/introductionPage.vue'
import HomePage from '../views/HomePage.vue'
import recordsView from '../views/recordsView.vue'
import LoginView from '../views/LoginView.vue'
// 👇 1. 引入剛剛建立的簽核頁面 (請確認你的檔案路徑是否在 views 資料夾)
import TeacherSignOff from '../views/TeacherSignOff.vue'

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
    path: '/login', // 登入頁
    name: 'LoginView',
    component: LoginView,
  },
  // 👇 2. 新增老師簽核頁面的路由
  {
    path: '/teacher-signoff', // 對應 Email 連結中的路徑
    name: 'TeacherSignOff',
    component: TeacherSignOff,
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
