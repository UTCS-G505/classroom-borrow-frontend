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
        borrowType: '單次借用',
        eventName: '程式設計課程',
        peopleCount: 20,
        description: '課程教學',
        teacherName: '李教授',
        borrowerDepartment: '資訊工程系',
        teacherDepartment: '資訊工程系',
        borrowerEmail: 'wang@example.com',
        teacherEmail: 'li@example.com',
        borrowerPhone: '0912-345-678',
        teacherPhone: '02-1234-5678',
      },
      {
        applicant: '陳XX',
        classroom: 'G516',
        date: '2025/07/31',
        startTime: '10:00',
        endTime: '12:00',
        status: '審核中',
        reason: '',
        borrowType: '單次借用',
        eventName: '學生會會議',
        peopleCount: 15,
        description: '學生會討論活動',
        teacherName: '張教授',
        borrowerDepartment: '學生會',
        teacherDepartment: '學務處',
        borrowerEmail: 'chen@example.com',
        teacherEmail: 'zhang@example.com',
        borrowerPhone: '0987-654-321',
        teacherPhone: '02-8765-4321',
      },
      {
        applicant: '張XX',
        classroom: 'G316',
        date: '2025/08/10',
        startTime: '14:00',
        endTime: '15:00',
        status: '審核中',
        reason: '',
        borrowType: '單次借用',
        eventName: '社團活動',
        peopleCount: 25,
        description: '社團幹部訓練活動',
        teacherName: '劉教授',
        borrowerDepartment: '學務處',
        teacherDepartment: '學務處',
        borrowerEmail: 'zhang@example.com',
        teacherEmail: 'liu@example.com',
        borrowerPhone: '0923-456-789',
        teacherPhone: '02-2345-6789',
      },
      {
        applicant: '林XX',
        classroom: 'G316',
        date: '2025/08/10 至 2025/12/31',
        multiStartDate: '2025.08.10',
        multiEndDate: '2025.12.31',
        startTime: '14:00',
        endTime: '15:00',
        status: '審核中',
        reason: '',
        borrowType: '多次借用',
        eventName: '週會課程',
        repeatType: '每周',
        peopleCount: 25,
        description: '每週定期課程教學',
        teacherName: '李教授',
        borrowerDepartment: '資訊科學系',
        teacherDepartment: '資訊科學系',
        borrowerEmail: 'zhang@example.com',
        teacherEmail: 'liu@example.com',
        borrowerPhone: '0923-456-789',
        teacherPhone: '02-2345-6789',
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

//詳細資訊彈窗
const showDetailModal = ref(false)
const detailApplication = ref(null)

//打開詳細資訊彈窗
function openDetail(app) {
  detailApplication.value = app
  showDetailModal.value = true
}

//關閉詳細資訊彈窗
function closeModal() {
  showDetailModal.value = false
}
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
          <td><button class="purpose" @click="openDetail(item)">詳細資訊</button></td>
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

  <!-- 詳細資訊彈出視窗 -->
  <div v-if="showDetailModal" class="modalOverlay" @click="closeModal">
    <div class="detail-content" @click.stop>
      <div class="detail-header">
        <h2>借用詳細資訊</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="detail-body">
        <!-- 基本資訊 -->
        <div class="detail-section">
          <h3>基本資訊</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">借用教室：</span>
              <span class="value">{{ detailApplication.classroom || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用類型：</span>
              <span class="value">{{ detailApplication.borrowType || '-' }}</span>
            </div>
            <div class="detail-item" v-if="detailApplication.borrowType === '多次借用'">
              <span class="label">重複頻率：</span>
              <span class="value">{{ detailApplication.repeatType || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用日期：</span>
              <span class="value" v-if="detailApplication.borrowType === '單次借用'">
                {{ detailApplication.date || '-' }}
              </span>
              <span class="value" v-else>
                {{ detailApplication.multiStartDate || '-' }} 至
                {{ detailApplication.multiEndDate || '-' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">活動時間：</span>
              <span class="value"
                >{{ detailApplication.startTime || '-' }} -
                {{ detailApplication.endTime || '-' }}</span
              >
            </div>
          </div>
        </div>

        <!-- 活動資訊 -->
        <div class="detail-section">
          <h3>活動資訊</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">活動名稱：</span>
              <span class="value">{{ detailApplication.eventName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">活動人數：</span>
              <span class="value">{{ detailApplication.peopleCount || '-' }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="label">活動內容說明：</span>
              <span class="value">{{ detailApplication.description || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 聯絡資訊 -->
        <div class="detail-section">
          <h3>聯絡資訊</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">借用人姓名：</span>
              <span class="value">{{ detailApplication.applicant || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">指導老師姓名：</span>
              <span class="value">{{ detailApplication.teacherName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用人系級：</span>
              <span class="value">{{ detailApplication.borrowerDepartment || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">指導老師系所：</span>
              <span class="value">{{ detailApplication.teacherDepartment || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用人Email：</span>
              <span class="value">{{ detailApplication.borrowerEmail || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">指導老師Email：</span>
              <span class="value">{{ detailApplication.teacherEmail || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用人電話：</span>
              <span class="value">{{ detailApplication.borrowerPhone || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">指導老師電話：</span>
              <span class="value">{{ detailApplication.teacherPhone || '-' }}</span>
            </div>
          </div>
        </div>
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

/* ---------- 輸入理由彈窗樣式 ---------- */
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

/* ---------- 詳細資訊彈窗樣式 ---------- */
.detail-content {
  color: #333;
  background-color: white;
  border-radius: 15px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  border-radius: 15px 15px 0 0;
}

.detail-header h2 {
  margin: 0;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 30px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.close-btn:hover {
  background-color: #f0f0f0;
}

.detail-body {
  padding: 30px;
}
.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-bottom: 15px;
  font-size: 20px;
  border-bottom: 2px solid #ccc;
  padding-bottom: 5px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
.detail-item.full-width {
  grid-column: 1 / -1;
}
.detail-item .label {
  font-weight: bold;
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}
.detail-item .value {
  color: #333;
  font-size: 16px;
  word-wrap: break-word;
}
.reason-content {
  text-align: left;
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
