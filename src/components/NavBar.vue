<script setup>
import { RouterLink } from 'vue-router'
import { ref, watch, onUnmounted, onMounted } from 'vue'

const links = [
  { to: '/', label: '首頁' },
  { to: '/borrow_status', label: '教室借用情況' },
  { to: '/introduction', label: '教室介紹' },
  { to: '/borrow', label: '申請借用' },
  { to: '/record', label: '借用紀錄' },
  { to: '/login', label: '登入' },
]

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Lock body scroll while mobile menu open
watch(isMobileMenuOpen, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

// Close on Escape key
onMounted(() => {
  const handler = (e) => {
    if (e.key === 'Escape') closeMobileMenu()
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <nav class="navbar">
    <div class="nav-brand">
      <RouterLink to="/" class="brand-link">資訊科學系教室借用系統</RouterLink>
    </div>

    <!-- Mobile menu button -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
      <span class="hamburger-line" :class="{ active: isMobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ active: isMobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ active: isMobileMenuOpen }"></span>
    </button>

    <!-- Navigation links -->
    <ul
      class="nav-links"
      :class="{ 'mobile-open': isMobileMenuOpen }"
      @click.self="closeMobileMenu"
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
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  --nav-bg: rgba(60, 60, 60, 0.75);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  min-height: 65px;
  background: var(--nav-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin: 0;
  position: relative;
}

.nav-brand .brand-link {
  font-weight: 600;
  font-size: 1.25rem;
  text-decoration: none;
  color: #fff;
  letter-spacing: 0.5px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  color: #fff;
  font-weight: 500;
  font-size: 1.1rem;
  transition:
    background-color 0.15s,
    color 0.15s,
    transform 0.15s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* Mobile menu button */
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
  z-index: 10;
}

.hamburger-line {
  width: 2rem;
  height: 0.25rem;
  background: #fff;
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

/* Mobile styles */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  /* Full-screen overlay menu */
  .nav-links {
    position: fixed;
    inset: 0; /* top:0 right:0 bottom:0 left:0 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin: 0;
    background: rgba(60, 60, 60, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transform: translateY(-100%); /* hidden above */
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.35s ease;
    z-index: 100; /* over navbar */
  }

  /* Slide starts visually from bottom edge of navbar (simulate by delaying part of motion) */
  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* Optional subtle stagger */
  .nav-links.mobile-open li { animation: fadeSlide 0.5s both; }
  .nav-links.mobile-open li:nth-child(1) { animation-delay: 0.05s; }
  .nav-links.mobile-open li:nth-child(2) { animation-delay: 0.1s; }
  .nav-links.mobile-open li:nth-child(3) { animation-delay: 0.15s; }
  .nav-links.mobile-open li:nth-child(4) { animation-delay: 0.2s; }
  .nav-links.mobile-open li:nth-child(5) { animation-delay: 0.25s; }
  .nav-links.mobile-open li:nth-child(6) { animation-delay: 0.3s; }

  @keyframes fadeSlide {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .nav-links li {
    width: auto; /* allow natural width for better centering */
    text-align: center;
    margin: 0.5rem 0;
  }

  .nav-link {
    display: block;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 8px; /* add border radius for better appearance */
    text-align: center;
    min-width: 200px; /* ensure consistent button width */
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px); /* subtle hover animation */
  }
}

/* Tablet styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .navbar {
    padding: 0 1rem;
  }

  .nav-brand .brand-link {
    font-size: 1.1rem;
  }

  .nav-links {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.3rem 0.5rem;
    font-size: 1rem;
  }
}

/* Small desktop adjustments */
@media (max-width: 1200px) and (min-width: 1025px) {
  .nav-links {
    gap: 0.6rem;
  }

  .nav-link {
    font-size: 1.05rem;
  }
}
</style>
