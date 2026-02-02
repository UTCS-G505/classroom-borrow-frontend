<script setup>
import { ref } from 'vue'

import BorrowReview from './BorrowReview.vue'
import BlacklistPage from './BlacklistPage.vue'
import AdminAnnouncements from './AdminAnnouncements.vue'

const links = [
  { label: '借用審核', id: 'borrow-review' },
  { label: '違規(黑名單)', id: 'blacklist-management' },
  { label: '公告管理', id: 'announcements' },
]

//預設頁面
const page = ref('borrow-review')

//點擊導覽列，切換頁面
function changePage(id) {
  page.value = id
}
</script>

<template>
  <div class="container">
    <!-- 側邊導覽列 -->
    <aside class="sidebar">
      <h2 class="sidebarTitle">管理員選單</h2>
      <ul>
        <li v-for="link in links" :key="link.id">
          <span :class="{ current: page === link.id }" @click="changePage(link.id)" class="navLink">
            {{ link.label }}
          </span>
        </li>
      </ul>
    </aside>

    <!-- 主內容區 -->
    <section class="content">
      <BorrowReview v-if="page === 'borrow-review'" />
      <BlacklistPage v-else-if="page === 'blacklist-management'" />
      <AdminAnnouncements v-else-if="page === 'announcements'" />
    </section>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  flex-direction: row;
}

/*側邊欄*/
.sidebar {
  width: 200px;
  background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
  color: #fff;
  padding: 1.5rem 1rem;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebarTitle {
  font-size: 18px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 0.5px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 8px;
}

.navLink {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  display: block;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 15px;
  font-weight: 500;
}

.navLink:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateX(4px);
}

.navLink.current {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.content {
  flex: 1;
  padding: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* --------- 手機版 RWD --------- */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(90deg, #4a5568 0%, #2d3748 100%);
  }

  .sidebarTitle {
    display: none;
  }

  .sidebar ul {
    display: flex;
    justify-content: space-around;
    gap: 8px;
  }

  .sidebar li {
    margin-bottom: 0;
    flex: 1;
  }

  .navLink {
    text-align: center;
    padding: 10px 8px;
    font-size: 14px;
  }

  .navLink:hover {
    transform: none;
  }

  .content {
    padding: 20px 15px;
  }
}
</style>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

html,
body {
  background-color: #f8f9fa;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
