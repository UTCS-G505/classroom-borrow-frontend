<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import adminApi from '../api/admin.api.js'

const toastStore = useToastStore()
const emit = defineEmits(['addBlacklist'])

const applications = ref([])
const isLoading = ref(true)

// Fetch bookings from backend
async function fetchBookings() {
  isLoading.value = true
  try {
    const response = await adminApi.getAllBookings()
    applications.value = response.data.map((item) => ({
      // Map backend fields to frontend display
      request_id: item.request_id,
      user_id: item.user_id,
      applicant: item.borrower_email?.split('@')[0] || '未知',
      classroom: item.classroom_id,
      date:
        item.borrow_type === '多次借用' && item.end_date
          ? `${formatDate(item.start_date)} 至 ${formatDate(item.end_date)}`
          : formatDate(item.start_date),
      multiStartDate: formatDate(item.start_date),
      multiEndDate: item.end_date ? formatDate(item.end_date) : null,
      startTime: formatTime(item.start_time),
      endTime: formatTime(item.end_time),
      status: item.status,
      reason: item.reject_reason || '',
      borrowType: item.borrow_type,
      eventName: item.event_name,
      peopleCount: item.people_count,
      description: item.reason,
      teacherName: item.teacher_name,
      borrowerDepartment: item.borrower_department,
      teacherDepartment: item.teacher_department,
      borrowerEmail: item.borrower_email,
      teacherEmail: item.teacher_email,
      borrowerPhone: item.borrower_phone,
      teacherPhone: item.teacher_phone,
    }))
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    toastStore.showToast('無法載入借用申請資料', 'error')
  } finally {
    isLoading.value = false
  }
}

// Format date from backend
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// Format time from backend (HH:MM:SS -> HH:MM)
function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.substring(0, 5)
}

onMounted(() => {
  fetchBookings()
})

// ---------- 彈窗控制區 ----------
const showModal = ref(false) // 控制彈窗是否顯示
const currentAction = ref('') //denied或blacklist
const currentApplication = ref(null)
const inputReason = ref('') // 使用者輸入的理由
const isSubmitting = ref(false)

// 打開彈窗，傳入動作和申請索引
function openModal(action, application) {
  currentAction.value = action
  currentApplication.value = application
  inputReason.value = '' //清空輸入框
  showModal.value = true
}

// 按下確認 → 更新申請的狀態與理由
async function submitReason() {
  if (!currentApplication.value) return

  isSubmitting.value = true
  const app = currentApplication.value

  try {
    if (currentAction.value === 'denied') {
      // Reject the booking
      await adminApi.updateBookingStatus(app.request_id, {
        status: 'rejected',
        reject_reason: inputReason.value,
      })
      app.status = '退件'
      app.reason = inputReason.value
      toastStore.showToast('已駁回申請', 'success')
    } else if (currentAction.value === 'blacklist') {
      // Reject and add to blacklist
      await adminApi.updateBookingStatus(app.request_id, {
        status: 'rejected',
        reject_reason: inputReason.value,
      })

      // Add to blacklist with 1 year expiration
      const expiredAt = new Date()
      expiredAt.setFullYear(expiredAt.getFullYear() + 1)
      await adminApi.addToBlacklist({
        user_id: app.user_id,
        reason: inputReason.value,
        expired_at: expiredAt.toISOString().split('T')[0],
      })

      app.status = '退件'
      app.reason = inputReason.value
      toastStore.showToast('已加入黑名單', 'success')

      emit('addBlacklist', {
        applicant: app.applicant,
        classroom: app.classroom,
        date: app.date,
        reason: inputReason.value,
      })
    }
  } catch (error) {
    console.error('Failed to update booking:', error)
    toastStore.showToast('操作失敗: ' + (error.response?.data?.error || '未知錯誤'), 'error')
  } finally {
    isSubmitting.value = false
    showModal.value = false
  }
}

// ---------- 核准申請 ----------
async function approve(application) {
  try {
    await adminApi.updateBookingStatus(application.request_id, {
      status: 'approved',
    })
    application.status = '核准'
    application.reason = ''
    toastStore.showToast('已核准申請', 'success')
  } catch (error) {
    console.error('Failed to approve booking:', error)
    toastStore.showToast('核准失敗: ' + (error.response?.data?.error || '未知錯誤'), 'error')
  }
}

// 區分待審核 / 已完成
const pendingApplications = computed(() =>
  applications.value.filter((item) => item.status === '審核中' || item.status === '教師核准'),
)

const reviewedApplications = computed(() =>
  applications.value.filter((item) => item.status !== '審核中' && item.status !== '教師核准'),
)

// ---------- 統計資料 ----------
// 動態計算總申請數、審核中數量、已核准數量
const stats = computed(() => {
  const total = applications.value.length //總申請數
  const pending = pendingApplications.value.length //審核中數量
  const approved = applications.value.filter((item) => item.status == '核准').length //已審核數量
  const disallowed = applications.value.filter((item) => item.status == '退件').length //駁回數量
  return { total, pending, approved, disallowed }
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
  <!-- Loading State -->
  <div v-if="isLoading" class="loading">
    <p>載入中...</p>
  </div>

  <template v-else>
    <!-- ---------- 當日借用統計 ---------- -->
    <section class="stats">
      <h3>借用統計</h3>

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
          <tr v-for="item in pendingApplications" :key="item.request_id">
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
          <tr v-for="item in reviewedApplications" :key="item.request_id">
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
  </template>

  <!-- 駁回 / 黑名單理由彈窗 -->
  <div v-if="showModal" class="modalOverlay">
    <div class="modal">
      <!-- 標題動態切換 -->
      <h3>請填寫{{ currentAction == 'denied' ? '駁回理由' : '加入黑名單理由' }}</h3>

      <!-- 理由輸入框 -->
      <textarea v-model="inputReason" placeholder="請輸入..." rows="5"></textarea>

      <!-- 彈窗按鈕區 -->
      <div class="modalButtons">
        <button @click="submitReason" :disabled="isSubmitting">
          {{ isSubmitting ? '處理中...' : '確認' }}
        </button>
        <button @click="showModal = false" :disabled="isSubmitting">取消</button>
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
.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
