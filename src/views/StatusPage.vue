<script setup>
const classrooms = [
  { id: 'G312', title: 'G312 會議室' },
  { id: 'G313', title: 'G313 普通教室' },
  { id: 'G314', title: 'G314 普通教室' },
  { id: 'G315', title: 'G315 電腦教室' },
  { id: 'G316', title: 'G316 電腦教室' },
  { id: 'G501', title: 'G501 會議室' },
  { id: 'G508', title: 'G508 系圖書室' },
  { id: 'G516', title: 'G516 電腦教室' },
  { id: 'G509', title: 'G509 IOS教室' },
]
</script>

<template>
  <div class="container">
    <!-- 側邊導覽列 -->
    <aside class="sidebar">
      <h2 class="sidebarTitle">可借用教室</h2>
      <ul>
        <li v-for="room in classrooms" :key="room.id">
          <span class="navLink">
            {{ room.title }}
          </span>
        </li>
      </ul>
    </aside>

    <!-- 手機版頂部導覽列 -->
    <nav class="mobile-nav">
      <ul>
        <li v-for="room in classrooms" :key="room.id">
          <button class="navBtn">
            {{ room.id }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- 主內容區 -->
    <section class="content"></section>
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
  background-color: #eae8e6;
  color: #333;
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
  color: #333;
  display: block;
  padding: 5px;
  transition: background-color 0.3s;
}

.navLink:hover {
  background-color: #d6d3d1;
}

/* 隱藏手機版導覽列 */
.mobile-nav {
  display: none;
}

.content {
  flex: 1; /* 自動撐滿剩下空間 */
  padding: 20px;
  background-color: #f6f6f5;
}

/* --------- 手機版 RWD --------- */
@media (max-width: 768px) {
  .mobile-nav {
    /* 顯示手機版導覽列 */
    display: block;
  }
  .container {
    flex-direction: column;
  }

  .sidebar {
    display: none; /* 手機隱藏左側欄 */
  }

  /* 手機頂部導覽列 */
  .mobile-nav {
    display: block;
    background-color: #eae8e6;
    padding: 0.5rem;
    overflow-x: auto; /* 可橫向捲動 */
    white-space: nowrap;
  }

  .mobile-nav ul {
    display: flex;
    gap: 0.5rem;
  }

  .mobile-nav li {
    list-style: none;
  }

  .navBtn {
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.3s;
  }

  .navBtn:hover {
    background: #ddd8d4;
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
