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

// Get status CSS class based on status value
function statusClass(status) {
  switch (status) {
    case '核准':
    case '已核准':
    case '借用中':
    case '已歸還':
      return 'status status-approved'
    case '退件':
    case '駁回':
    case '已取消':
      return 'status status-rejected'
    case '審核中':
    case '教師核准':
      return 'status status-pending'
    default:
      return 'status'
  }
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
    <div class="spinner"></div>
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
              <span :class="statusClass(item.status)">{{ item.status }}</span>
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
      <p v-else class="empty-state">目前沒有待審核的申請</p>
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
            <td>
              <span :class="statusClass(item.status)">{{ item.status }}</span>
            </td>
            <td>{{ item.reason || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-state">目前沒有已完成審核的資料</p>
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
/* Loading State */
.loading {
  text-align: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #4a5568;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  font-size: 16px;
  color: #666;
}

/* Section Cards */
.stats,
.review,
.reviewed {
  background-color: #fff;
  padding: 25px 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  margin-bottom: 25px;
}

/* Statistics Section */
.stats h3,
.review h3,
.reviewed h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.data {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 15px;
  margin-top: 10px;
  color: #555;
}

.data strong {
  color: #333;
  font-size: 18px;
}

.divider {
  color: #ddd;
}

/* Table Styles */
table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 15px;
}

thead {
  background-color: #f8f9fa;
}

th {
  color: #555;
  padding: 14px 12px;
  font-weight: 600;
  font-size: 15px;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 16px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  color: #444;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* Status Badges */
.status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-approved {
  background-color: #d1eddd;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 15px;
}

/* Button Styles */
button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-right: 6px;
  transition: all 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:last-child {
  margin-right: 0;
}

/* Approve Button */
.approve {
  background-color: #d1eddd;
  color: #155724;
}

.approve:hover {
  background-color: #b8e0c4;
  transform: translateY(-1px);
}

/* Deny Button */
.denied {
  background-color: #f8d7da;
  color: #721c24;
}

.denied:hover {
  background-color: #f1c1c5;
  transform: translateY(-1px);
}

/* Blacklist Button - Less prominent */
.blacklist {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.blacklist:hover {
  background-color: #f3f4f6;
  color: #4b5563;
  transform: translateY(-1px);
}

/* Purpose/Details Button */
.purpose {
  background-color: #e9ecef;
  color: #495057;
}

.purpose:hover {
  background-color: #dee2e6;
  transform: translateY(-1px);
}

/* Modal Overlay */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

/* Reason Modal */
.modal {
  background-color: #fff;
  padding: 25px;
  border-radius: 15px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  border-bottom: none;
  padding-bottom: 0;
}

.modal textarea {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  resize: none;
  font-size: 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.modal textarea:focus {
  outline: none;
  border-color: #4a5568;
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
}

.modalButtons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.modalButtons button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.modalButtons button:first-child {
  background-color: #4a5568;
  color: #fff;
}

.modalButtons button:first-child:hover {
  background-color: #2d3748;
}

.modalButtons button:last-child {
  background-color: #e5e7eb;
  color: #4b5563;
}

.modalButtons button:last-child:hover {
  background-color: #d1d5db;
}

/* Detail Modal */
.detail-content {
  color: #333;
  background-color: white;
  border-radius: 15px;
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.2s ease-out;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8f9fa;
  border-radius: 15px 15px 0 0;
  position: sticky;
  top: 0;
}

.detail-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin: 0;
}

.close-btn:hover {
  background-color: #e5e7eb;
  color: #4b5563;
}

.detail-body {
  padding: 25px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #4a5568;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 4px;
}

.detail-item .value {
  color: #333;
  font-size: 15px;
  word-wrap: break-word;
}

/* Responsive */
@media (max-width: 768px) {
  .stats,
  .review,
  .reviewed {
    padding: 20px;
    margin-bottom: 15px;
  }

  .data {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .divider {
    display: none;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  td button {
    display: block;
    width: 100%;
    margin: 4px 0;
  }

  .modal {
    width: 90%;
    padding: 20px;
  }

  .modalButtons {
    flex-direction: column;
  }

  .modalButtons button {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    padding: 15px 20px;
  }

  .detail-body {
    padding: 20px;
  }
}
</style>
