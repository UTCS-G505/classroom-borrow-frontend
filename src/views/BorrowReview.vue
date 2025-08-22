<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const emit = defineEmits(['addBlacklist'])

const applications = ref([])

// 初始化：從 localStorage 載入
onMounted(() => {
  const saved = localStorage.getItem('applications')
  if (saved) {
    applications.value = JSON.parse(saved)
  } else {
    applications.value = [
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
    ]
  }
})

// 監聽 → 儲存
watch(
  applications,
  (val) => {
    localStorage.setItem('applications', JSON.stringify(val))
  },
  { deep: true },
)

// ---------- 彈窗控制區 ----------
const showModal = ref(false) // 控制彈窗是否顯示
const currentAction = ref('') //denied或blacklist
const currentApplication = ref(null)
const inputReason = ref('') // 使用者輸入的理由

// 打開彈窗，傳入動作和申請索引
function openModal(action, application) {
  currentAction.value = action
  currentApplication.value = application
  inputReason.value = '' //清空輸入框
  showModal.value = true
}

// 按下確認 → 更新申請的狀態與理由
function submitReason() {
  if (currentApplication.value) {
    const app = currentApplication.value
    app.status = currentAction.value === 'denied' ? '駁回' : '黑名單'
    app.reason = inputReason.value // 紀錄理由

    if (currentAction.value === 'blacklist') {
      emit('addBlacklist', {
        applicant: app.applicant,
        classroom: app.classroom,
        date: app.date,
        reason: inputReason.value,
      })
    }
  }
  showModal.value = false // 關閉視窗
}

// ---------- 核准申請 ----------
// 將申請狀態改為 "已核准"
function approve(application) {
  application.status = '已核准'
  application.reason = ''
}

// 區分待審核 / 已完成
const pendingApplications = computed(() =>
  applications.value.filter((item) => item.status === '審核中'),
)

const reviewedApplications = computed(() =>
  applications.value.filter((item) => item.status !== '審核中'),
)

// ---------- 統計資料 ----------
// 動態計算總申請數、審核中數量、已核准數量
const stats = computed(() => {
  const total = applications.value.length //總申請數
  const pending = pendingApplications.value.length //審核中數量
  const approved = applications.value.filter((item) => item.status == '已核准').length //已審核數量
  const disallowed = applications.value.filter((item) => item.status == '駁回').length //駁回數量
  const blacklist = applications.value.filter((item) => item.status == '黑名單').length //黑名單數量
  return { total, pending, approved, disallowed, blacklist }
})
</script>

<template>
  <!-- ---------- 當日借用統計 ---------- -->
  <section class="stats">
    <h3>今日借用統計</h3>

    <div class="data">
      <span
        >總借用：<strong>{{ stats.total }}</strong></span
      >
      <span class="divider">|</span>
      <span
        >審核中：<strong>{{ stats.pending }}</strong></span
      >
      <span class="divider">|</span>
      <span
        >已核准：<strong>{{ stats.approved }}</strong></span
      >
      <span class="divider">|</span>
      <span
        >駁回：<strong>{{ stats.disallowed }}</strong></span
      >
      <span class="divider">|</span>
      <span
        >黑名單：<strong>{{ stats.blacklist }}</strong></span
      >
    </div>
  </section>

  <!-- ---------- 待審核申請列表 ---------- -->
  <section class="review">
    <h3>待審核申請</h3>
    <table v-if="pendingApplications.length">
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
        <tr v-for="(item, index) in pendingApplications" :key="index">
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
            <button class="approve" @click="approve(item)">核准</button>
            <button class="denied" @click="openModal('denied', item)">駁回</button>
            <button class="blacklist" @click="openModal('blacklist', item)">加入黑名單</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>目前沒有待審核的申請</p>
  </section>

  <!-- 已完成審核 -->
  <section class="reviewed">
    <h3>已完成審核</h3>
    <table v-if="reviewedApplications.length">
      <thead>
        <tr>
          <th>申請人</th>
          <th>教室</th>
          <th>時間</th>
          <th>狀態</th>
          <th>備註</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in reviewedApplications" :key="index">
          <td>{{ item.applicant }}</td>
          <td>{{ item.classroom }}</td>
          <td>{{ item.date }} {{ item.startTime }} - {{ item.endTime }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.reason || '-' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>目前沒有已完成審核的資料。</p>
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
.review,
.reviewed {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.data {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  margin-top: 10px;
}

.divider {
  color: #ccc;
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

/* --------- 手機版 RWD --------- */
@media (max-width: 768px) {
  /* 統計區改直排 */
  .data {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .divider {
    display: none; /* 手機就不要顯示分隔線 */
  }

  /* 表格支援橫向捲動 */
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  /* 操作按鈕：堆疊顯示 */
  td button {
    display: block;
    width: 100%;
    margin: 5px 0;
  }

  /* 彈窗寬度調整 */
  .modal {
    width: 80%;
    padding: 15px;
  }

  /* 彈窗按鈕改直排 */
  .modalButtons {
    flex-direction: column;
  }

  .modalButtons button {
    width: 100%;
  }
}
</style>
