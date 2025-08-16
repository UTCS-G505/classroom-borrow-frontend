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
    reason: '',
  },
  {
    applicant: '陳XX',
    classroom: 'G516',
    date: '2025/07/31',
    startTime: '10:00',
    endTime: '12:00',
    status: '審核中',
    reason: '',
  },
  {
    applicant: '張XX',
    classroom: 'G316',
    date: '2025/08/10',
    startTime: '14:00',
    endTime: '15:00',
    status: '審核中',
    reason: '',
  },
])

// ---------- 彈窗控制區 ----------
const showModal = ref(false) // 控制彈窗是否顯示
const currentAction = ref('') //denied或blacklist
const currentIndex = ref(null)
const inputReason = ref('') // 使用者輸入的理由

// 打開彈窗，傳入動作和申請索引
function openModal(action, index) {
  currentAction.value = action
  currentIndex.value = index
  inputReason.value = '' //清空輸入框
  showModal.value = true
}

// 按下確認 → 更新申請的狀態與理由
function submitReason() {
  if (currentIndex.value !== null) {
    const app = applications.value[currentIndex.value]
    app.status = currentAction.value === 'denied' ? '駁回' : '黑名單'
    app.reason = inputReason.value // 紀錄理由
  }
  showModal.value = false // 關閉視窗
}

// ---------- 核准申請 ----------
// 將申請狀態改為 "已核准"
function approve(index) {
  applications.value[index].status = '已核准'
  applications.value[index].reason = ''
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
            <!-- 若駁回或加入黑名單，顯示理由 -->
            <div v-if="item.reason" class="showReason">備註：{{ item.reason }}</div>
          </td>
          <td>
            <!-- 操作按鈕 -->
            <button class="approve" @click="approve(index)">核准</button>
            <button class="denied" @click="openModal('denied', index)">駁回</button>
            <button class="blacklist" @click="openModal('blacklist', index)">加入黑名單</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- 駁回 / 黑名單理由彈窗 -->
  <div v-if="showModal" class="modalOverlay">
    <div class="modal">
      <!-- 標題動態切換 -->
      <h3>請填寫{{ currentAction == 'denied' ? '駁回理由' : '加入黑名單理由' }}</h3>

      <!-- 理由輸入框 -->
      <textarea v-model="inputReason" placeholder="請輸入..." rows="5"></textarea>

      <!-- 彈窗按鈕區 -->
      <div class="modalButtons">
        <button @click="submitReason">確認</button>
        <button @click="showModal = false">取消</button>
      </div>
    </div>
  </div>
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
  padding: 8px 10px;
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

/* ---------- 彈窗樣式 ---------- */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 保證在最上層 */
}

.modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 100%;
}

/* 輸入框 */
.modal textarea {
  width: 100%;
  margin-top: 10px;
  padding: 5px;
  resize: none;
  font-size: 16px;
  border: solid 1px #ccc;
}

/* 彈窗按鈕區 (彈性排版 + 間距) */
.modalButtons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
}

.modalButtons button {
  background-color: #dcdddf;
  color: #666;
}

/* 理由文字 */
.showReason {
  font-size: 12px;
  color: #999;
}
</style>
