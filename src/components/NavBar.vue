<script setup>
import { RouterLink } from 'vue-router'

const links = [
  { to: '/', label: '首頁' },
  { to: '/borrow_status', label: '教室借用情況' },
  { to: '/introduction', label: '教室介紹' },
  { to: '/borrow', label: '申請借用' },
  { to: '/record', label: '借用紀錄' },
  { to: '/login', label: '登入' },
]
</script>

<template>
  <nav class="navbar">
    <div class="nav-brand">
      <RouterLink to="/" class="brand-link">資訊科學系教室借用系統</RouterLink>
    </div>
    <ul class="nav-links">
      <li v-for="l in links" :key="l.to">
        <RouterLink :to="l.to" class="nav-link" active-class="active" exact-active-class="active">{{
          l.label
        }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  --nav-bg: #57565d; /* extracted from provided image */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem; /* remove vertical padding to eliminate gap with borders */
  min-height: 65px;
  background: var(--nav-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin: 0;
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
    color 0.15s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 640px) {
  .navbar {
    flex-wrap: wrap;
    padding: 0.5rem 1rem;
  }
  .nav-links {
    width: 100%;
    justify-content: flex-start;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }
  .nav-link {
    padding: 0.4rem 0.55rem;
  }
}
</style>
