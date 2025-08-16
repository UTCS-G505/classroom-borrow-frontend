<script setup>
import { ref, computed } from 'vue'

//申請資料(先用假資料，到時候要改成從借用畫面那邊傳過來)
const applications = ref([
  {
    applicant: '王XX',
    classroom: 'G508',
    date: '2025/07/30',
    startTime: '12:00',
    endTime: '15:00',
    status: '審核中',
  },
  {
    applicant: '陳XX',
    classroom: 'G516',
    date: '2025/07/31',
    startTime: '10:00',
    endTime: '12:00',
    status: '審核中',
  },
  {
    applicant: '張XX',
    classroom: 'G316',
    date: '2025/08/10',
    startTime: '14:00',
    endTime: '15:00',
    status: '審核中',
  },
])

// ---------- 核准申請 ----------
// 將申請狀態改為 "已核准"
function approve(index) {
  applications.value[index].status = '已核准'
}

// ---------- 加入黑名單 ----------
// 將申請狀態改為 "黑名單"
function blacklist(index) {
  applications.value[index].status = '黑名單'
}

// ---------- 駁回申請 ----------
// 將申請狀態改為 "駁回"
function denied(index) {
  applications.value[index].status = '駁回'
}

// ---------- 統計資料 ----------
// 動態計算總申請數、審核中數量、已核准數量
const stats = computed(() => {
  const total = applications.value.length //總申請數
  const pending = applications.value.filter((item) => item.status == '審核中').length //審核中數量
  const approved = applications.value.filter((item) => item.status == '已核准').length //已審核數量
  return { total, pending, approved }
})
</script>

<template>
  <!-- ---------- 當日借用統計 ---------- -->
  <section class="stats">
    <h3>今日借用統計</h3>
    <p>總借用：{{ stats.total }} | 審核中：{{ stats.pending }} | 已核准：{{ stats.approved }}</p>
  </section>

  <!-- ---------- 待審核申請列表 ---------- -->
  <section class="review">
    <h3>待審核申請</h3>
    <table>
      <thead>
        <tr>
          <th>申請人</th>
          <th>教室</th>
          <th>時間</th>
          <th>用途</th>
          <th>狀態</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <!-- 逐筆顯示申請資料 -->
        <tr v-for="(item, index) in applications" :key="index">
          <td>{{ item.applicant }}</td>
          <td>{{ item.classroom }}</td>
          <td>{{ item.date }} {{ item.startTime }} - {{ item.endTime }}</td>
          <td><button class="purpose">詳細資訊</button></td>
          <td>
            <!-- 顯示當前狀態 -->
            <span>{{ item.status }}</span>
          </td>
          <td>
            <!-- 操作按鈕 -->
            <button class="approve" @click="approve(index)">核准</button>
            <button class="denied" @click="denied(index)">駁回</button>
            <button class="blacklist" @click="blacklist(index)">加入黑名單</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.stats,
.review {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #e6e6e6;
}

th,
td {
  border: solid 1px #ddd;
  padding: 8px;
  text-align: center;
}

/* ---------- 狀態標籤樣式 ---------- */
.status {
  padding: 2px 8px;
  border-radius: 4px;
  color: #333;
}

/* ---------- 按鈕樣式 ---------- */
button {
  padding: 5px 8px;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  margin-right: 5px;
}

/* 核准按鈕 */
.approve {
  background-color: #3d87e5;
}

/* 駁回按鈕 */
.denied {
  background-color: #e54c4f;
}

/* 黑名單按鈕 */
.blacklist {
  background-color: #444;
}

/* 用途按鈕 */
.purpose {
  background-color: #dcdddf;
  color: #666;
}
</style>
