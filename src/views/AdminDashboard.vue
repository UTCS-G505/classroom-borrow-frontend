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
  width: 160px;
  background-color: #5d5c61;
  color: #fff;
  padding: 1rem;
}

.sidebarTitle {
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 15px;
  cursor: pointer;
}

.navLink {
  text-decoration: none;
  color: #fff;
  display: block;
  padding: 8px;
  transition: background-color 0.3s;
}

.navLink:hover {
  background-color: #777;
}

.navLink.current {
  background-color: #777;
}

.content {
  flex: 1; /* 自動撐滿剩下空間 */
  padding: 20px;
  background-color: #f6f6f5;
}

/* --------- 手機版 RWD --------- */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 0.5rem;
  }

  .sidebarTitle {
    display: none; /* 手機版隱藏大標題，省空間 */
  }

  .sidebar ul {
    display: flex; /* 導覽改成橫向 */
    justify-content: space-around;
  }

  .sidebar li {
    margin-bottom: 0;
  }
}
</style>

<style>
* {
  padding: 0;
  margin: 0;
}

html,
body {
  background-color: #f6f6f5;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 防止橫向捲動 */
}
</style>
