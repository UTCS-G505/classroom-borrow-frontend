<script setup>
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import logo from '@/assets/logo.png'

import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

const links = computed(() => {
  return [
    { to: '/home', label: '首頁' },
    { to: '/borrow_status', label: '教室借用情況' },
    { to: '/introduction', label: '教室介紹' },
    { to: '/borrow', label: '申請借用' },
    { to: '/record', label: '借用紀錄' },
  ]
})

const isAdmin = computed(() => {
  console.log('userStore.role.value', userStore.role.value)
  const role = userStore.role.value
  return role !== '' && role <= 1
})

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const isUserMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isUserMenuOpen.value = false
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

// 登出功能
const handleLogout = async () => {
  await authStore.logout()
  userStore.clearUserProfile()
  isUserMenuOpen.value = false
  isMobileMenuOpen.value = false
  router.push('/login')
}

// 核心邏輯：檢查登入狀態
const checkLoginStatus = async () => {
  if (authStore.isLoggedIn.value) {
    await userStore.fetchUserProfile()
  } else {
    userStore.clearUserProfile()
  }
}

watch(
  () => route.path,
  () => {
    checkLoginStatus()
    closeMobileMenu()
  },
)

// Watch for changes in login status
watch(
  () => authStore.isLoggedIn.value,
  async (newValue) => {
    if (newValue) {
      // User just logged in, fetch profile
      await userStore.fetchUserProfile()
    } else {
      // User logged out, clear username
      userStore.clearUserProfile()
    }
  },
)

watch(isMobileMenuOpen, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onMounted(() => {
  checkLoginStatus()

  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu()
      isUserMenuOpen.value = false
    }
  }
  const clickOutsideHandler = (e) => {
    if (isUserMenuOpen.value && !e.target.closest('.user-menu-container')) {
      isUserMenuOpen.value = false
    }
  }

  window.addEventListener('keydown', escapeHandler)
  window.addEventListener('click', clickOutsideHandler)
  window.addEventListener('scroll', handleScroll)

  onUnmounted(() => {
    window.removeEventListener('keydown', escapeHandler)
    window.removeEventListener('click', clickOutsideHandler)
    window.removeEventListener('scroll', handleScroll)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  })
})
</script>

<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="nav-brand">
      <RouterLink to="/" class="brand-link">
        <img :src="logo" alt="Logo" class="logo" />
        <span class="brand-text">資訊科學系教室借用系統</span>
      </RouterLink>
    </div>

    <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
      <span class="hamburger-line" :class="{ active: isMobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ active: isMobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ active: isMobileMenuOpen }"></span>
    </button>

    <ul
      class="nav-links"
      :class="{ 'mobile-open': isMobileMenuOpen }"
      aria-hidden="false"
      role="menu"
    >
      <li v-for="l in links" :key="l.to">
        <RouterLink
          :to="l.to"
          class="nav-link"
          active-class="active"
          exact-active-class="active"
          @click="closeMobileMenu"
        >
          {{ l.label }}
        </RouterLink>
      </li>

      <li class="auth-item">
        <RouterLink
          v-if="!authStore.isLoggedIn"
          to="/login"
          class="nav-link"
          active-class="active"
          @click="closeMobileMenu"
        >
          登入
        </RouterLink>

        <div v-else class="user-menu-container">
          <button class="nav-link user-btn" @click.stop="toggleUserMenu">
            <span class="username-text">{{ userStore.username || '載入中...' }}</span>
            <span class="arrow" :class="{ rotate: isUserMenuOpen }">▼</span>
          </button>

          <div v-if="isUserMenuOpen" class="user-dropdown-menu">
            <RouterLink v-if="isAdmin" to="/admin" class="dropdown-item" @click="closeMobileMenu">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                ></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>借用管理</span>
            </RouterLink>
            <button @click="handleLogout" class="dropdown-item logout-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="logout-icon-svg"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>登出</span>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* 基礎樣式 */
.navbar {
  --nav-bg: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  min-height: 65px;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
}
.navbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: -1;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease;
}
.navbar.scrolled {
  --nav-bg: rgba(255, 255, 255, 0.5);
}
.nav-brand .brand-link {
  font-weight: 600;
  font-size: 1.25rem;
  text-decoration: none;
  color: #333;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  align-items: center;
}
.nav-link {
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  color: #333;
  font-weight: 500;
  font-size: 1.1rem;
  transition:
    background-color 0.15s,
    color 0.15s,
    transform 0.15s ease;
  cursor: pointer;
  background: transparent;
  border: none;
  font-family: inherit;
}
.nav-link:hover,
.nav-link.active {
  background: rgba(0, 0, 0, 0.08);
}

/* 原本的 .login-btn 樣式已移除，現在「登入」會跟其他連結一樣顏色 */

.user-menu-container {
  position: relative;
}
.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f3f4f6;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
}
.user-btn:hover {
  background-color: #e5e7eb;
}
.arrow {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.3s ease;
}
.arrow.rotate {
  transform: rotate(180deg);
}
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
}
.dropdown-item.logout-btn {
  color: #dc3545;
}
.dropdown-item:hover {
  background-color: #fff5f5;
}
.logout-icon-svg {
  opacity: 0.7;
}
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1200;
  position: relative;
}
.hamburger-line {
  width: 2rem;
  height: 0.25rem;
  background: #333;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}
.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg);
}
.hamburger-line.active:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}
.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg);
}
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  .logo {
    height: 32px;
  }
  .brand-text {
    font-size: 1rem;
  }
  .nav-links {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.45s,
      opacity 0.35s;
    z-index: 1100;
  }
  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  .nav-link {
    display: block;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    text-align: center;
    width: 100%;
  }
  .user-menu-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .user-btn {
    font-size: 1.2rem;
    padding: 1rem 2rem;
    background: transparent;
  }
  .user-dropdown-menu {
    position: static;
    box-shadow: none;
    border: none;
    background: transparent;
    padding: 0;
    margin-top: 0;
    animation: none;
  }
}
@media (max-width: 1024px) and (min-width: 769px) {
  .navbar {
    padding: 0 1rem;
  }
  .logo {
    height: 35px;
  }
}
</style>
