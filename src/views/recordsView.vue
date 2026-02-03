<script setup>
import { reactive, onMounted, ref } from 'vue'
import { bookingsApi } from '@/api/bookings.api'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'

const userStore = useUserStore()
const toastStore = useToastStore()

// 控制彈出視窗的顯示
const showDetailModal = ref(false)
const showReasonModal = ref(false)
const showConfirmModal = ref(false)
const currentRecord = ref({})
const isLoading = ref(false)
const error = ref('')

// Confirm Modal State
const confirmType = ref('') // 'return' or 'cancel'
const confirmRecord = ref(null)
const isProcessing = ref(false)

// 狀態樣式分類函數
const statusClass = (status) => {
  switch (status) {
    case '已歸還':
      return 'status-gray'
    case '駁回':
    case '退件':
    case '已取消':
      return 'status-red'
    case '借用中':
    case '核准':
      return 'status-green'
    case '審核中':
      return 'status-yellow'
    default:
      return 'status-gray'
  }
}

// Map API status to action
const getAction = (status) => {
  switch (status) {
    case '退件':
    case '駁回':
      return '查看原因'
    case '借用中':
    case '已核准':
      return '我要歸還'
    case '審核中':
      return '取消申請'
    default:
      return ''
  }
}

// Format date from API (2025-11-05T00:00:00.000Z -> 2025.11.05)
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// Format time range
const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return ''
  // Remove seconds if present (10:00:00 -> 10:00)
  const start = startTime.slice(0, 5)
  const end = endTime.slice(0, 5)
  return `${start} - ${end}`
}

// Records array
const records = reactive([])

// Fetch records from API
const fetchRecords = async () => {
  const userId = userStore.userId.value
  if (!userId) {
    error.value = '無法取得用戶資訊'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await bookingsApi.getMyBookings(userId)

    // Clear existing records
    records.splice(0, records.length)

    // Map API response to record format
    const apiRecords = response.data || []
    apiRecords.forEach((item) => {
      const record = {
        id: `BR${String(item.request_id).padStart(4, '0')}`,
        request_id: item.request_id,
        date:
          item.borrow_type === '多次借用' && item.end_date
            ? `${formatDate(item.start_date)} 至 ${formatDate(item.end_date)}`
            : formatDate(item.start_date),
        room: item.classroom_id,
        time: formatTimeRange(item.start_time, item.end_time),
        status: item.status,
        action: getAction(item.status),
        eventName: item.event_name,
        peopleCount: item.people_count,
        borrowType: item.borrow_type,
        description: item.reason,
        borrowerName: item.borrower_name || userStore.username.value || '',
        teacherName: item.teacher_name,
        borrowerDepartment: item.borrower_department,
        teacherDepartment: item.teacher_department,
        borrowerEmail: item.borrower_email,
        teacherEmail: item.teacher_email,
        borrowerPhone: item.borrower_phone,
        teacherPhone: item.teacher_phone,
        rejectReason: item.reject_reason,
        multiStartDate: item.borrow_type === '多次借用' ? formatDate(item.start_date) : null,
        multiEndDate: item.borrow_type === '多次借用' ? formatDate(item.end_date) : null,
      }
      records.push(record)
    })
  } catch (err) {
    console.error('獲取記錄失敗:', err)
    if (err.response?.status === 401) {
      error.value = '請先登入'
    } else {
      error.value = '獲取記錄失敗，請稍後再試'
    }
  } finally {
    isLoading.value = false
  }
}

// 顯示詳細資訊
const showDetails = (record) => {
  currentRecord.value = record
  showDetailModal.value = true
}

// 顯示駁回原因
const showReason = (record) => {
  currentRecord.value = record
  showReasonModal.value = true
}

// 開啟確認視窗
const openConfirmModal = (type, record) => {
  confirmType.value = type
  confirmRecord.value = record
  showConfirmModal.value = true
}

// 關閉確認視窗
const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmType.value = ''
  confirmRecord.value = null
}

// 確認操作
const handleConfirm = async () => {
  if (!confirmRecord.value) return

  if (confirmType.value === 'return') {
    await processReturn(confirmRecord.value)
  } else if (confirmType.value === 'cancel') {
    await processCancel(confirmRecord.value)
  }
  closeConfirmModal()
}

// 歸還操作
const returnItem = (record) => {
  openConfirmModal('return', record)
}

// 實際執行歸還
const processReturn = async (record) => {
  isProcessing.value = true
  try {
    await bookingsApi.returnBooking(record.request_id)

    // 更新狀態
    record.status = '已歸還'
    record.action = ''

    toastStore.showToast('歸還申請已送出', 'success')
  } catch (err) {
    console.error('歸還失敗:', err)
    toastStore.showToast(err.response?.data?.message || '歸還失敗，請稍後再試', 'error')
  } finally {
    isProcessing.value = false
  }
}

// 取消申請
const cancelApplication = (record) => {
  openConfirmModal('cancel', record)
}

// 實際執行取消
const processCancel = async (record) => {
  isProcessing.value = true
  try {
    await bookingsApi.cancelBooking(record.request_id)

    // 從紀錄中移除或更新狀態
    const index = records.findIndex((r) => r.id === record.id)
    if (index > -1) {
      records[index].status = '已取消'
      records[index].action = ''
    }

    toastStore.showToast('取消申請已送出', 'success')
  } catch (err) {
    console.error('取消失敗:', err)
    toastStore.showToast(err.response?.data?.message || '取消失敗，請稍後再試', 'error')
  } finally {
    isProcessing.value = false
  }
}

// 關閉彈出視窗
const closeModal = () => {
  showDetailModal.value = false
  showReasonModal.value = false
  currentRecord.value = {}
}

onMounted(() => {
  // Fetch records from API
  fetchRecords()
})
</script>

<template>
  <div class="records-view">
    <h1 class="title">借用紀錄</h1>
    <hr />
    <div class="record-container">
      <!-- 電腦版table -->
      <table class="record-table desktop-only">
        <thead>
          <tr style="color: #cfe2ff">
            <th>借用日期</th>
            <th>借用教室</th>
            <th>活動時間</th>
            <th>目前狀態</th>
            <th>詳細資訊</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in records" :key="item.id">
            <td>{{ item.date }}</td>
            <td>{{ item.room }}</td>
            <td>{{ item.time }}</td>
            <td>
              <span :class="['status', statusClass(item.status)]">{{ item.status }}</span>
            </td>
            <td>
              <button class="btn btn-blue" @click="showDetails(item)">詳細資訊</button>
            </td>
            <td>
              <button
                v-if="item.action === '查看原因'"
                class="btn btn-purple"
                @click="showReason(item)"
              >
                查看原因
              </button>
              <button
                v-else-if="item.action === '我要歸還'"
                class="btn btn-orange"
                @click="returnItem(item)"
              >
                我要歸還
              </button>
              <button
                v-else-if="item.action === '取消申請'"
                class="btn btn-red"
                @click="cancelApplication(item)"
              >
                取消申請
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 手機版 card -->
      <div class="mobile-only">
        <div class="record-card" v-for="item in records" :key="item.id">
          <div class="card-header">
            <div class="room">{{ item.room }}</div>
            <span :class="['status', statusClass(item.status)]">{{ item.status }}</span>
          </div>
          <div class="card-body">
            <p><strong>日期：</strong>{{ item.date }}</p>
            <p><strong>時間：</strong>{{ item.time }}</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-blue" @click="showDetails(item)">詳細資訊</button>
            <button
              v-if="item.action === '查看原因'"
              class="btn btn-purple"
              @click="showReason(item)"
            >
              查看原因
            </button>
            <button
              v-else-if="item.action === '我要歸還'"
              class="btn btn-orange"
              @click="returnItem(item)"
            >
              我要歸還
            </button>
            <button
              v-else-if="item.action === '取消申請'"
              class="btn btn-red"
              @click="cancelApplication(item)"
            >
              取消申請
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細資訊彈出視窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>借用詳細資訊</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h3>基本資訊</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">申請編號：</span>
                <span class="value">{{ currentRecord.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">借用教室：</span>
                <span class="value">{{ currentRecord.room }}</span>
              </div>
              <div class="detail-item">
                <span class="label">借用類型：</span>
                <span class="value">{{ currentRecord.borrowType }}</span>
              </div>
              <div class="detail-item" v-if="currentRecord.borrowType === '多次借用'">
                <span class="label">重複頻率：</span>
                <span class="value">{{ currentRecord.repeatType }}</span>
              </div>
              <div class="detail-item" v-if="currentRecord.borrowType === '單次借用'">
                <span class="label">借用日期：</span>
                <span class="value">{{ currentRecord.date }}</span>
              </div>
              <div class="detail-item" v-if="currentRecord.borrowType === '多次借用'">
                <span class="label">起始日期：</span>
                <span class="value">{{ currentRecord.multiStartDate }}</span>
              </div>
              <div class="detail-item" v-if="currentRecord.borrowType === '多次借用'">
                <span class="label">結束日期：</span>
                <span class="value">{{ currentRecord.multiEndDate }}</span>
              </div>
              <div class="detail-item">
                <span class="label">活動時間：</span>
                <span class="value">{{ currentRecord.time }}</span>
              </div>
              <div class="detail-item">
                <span class="label">目前狀態：</span>
                <span :class="['status', statusClass(currentRecord.status)]">{{
                  currentRecord.status
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>活動資訊</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">活動名稱：</span>
                <span class="value">{{ currentRecord.eventName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">活動人數：</span>
                <span class="value">{{ currentRecord.peopleCount }}</span>
              </div>
              <div class="detail-item">
                <span class="label">借用類型：</span>
                <span class="value">{{ currentRecord.borrowType }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="label">活動內容說明：</span>
                <span class="value">{{ currentRecord.description }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>聯絡資訊</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">借用人姓名：</span>
                <span class="value">{{ currentRecord.borrowerName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">指導老師姓名：</span>
                <span class="value">{{ currentRecord.teacherName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">借用人系級：</span>
                <span class="value">{{ currentRecord.borrowerDepartment }}</span>
              </div>
              <div class="detail-item">
                <span class="label">指導老師系所：</span>
                <span class="value">{{ currentRecord.teacherDepartment }}</span>
              </div>
              <div class="detail-item">
                <span class="label">借用人Email：</span>
                <span class="value">{{ currentRecord.borrowerEmail }}</span>
              </div>
              <div class="detail-item">
                <span class="label">指導老師Email：</span>
                <span class="value">{{ currentRecord.teacherEmail }}</span>
              </div>
              <div class="detail-item">
                <span class="label">借用人電話：</span>
                <span class="value">{{ currentRecord.borrowerPhone }}</span>
              </div>
              <div class="detail-item">
                <span class="label">指導老師電話：</span>
                <span class="value">{{ currentRecord.teacherPhone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看原因彈出視窗 -->
    <div v-if="showReasonModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>駁回原因</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="reason-content">
            <div class="detail-item">
              <span class="label">申請編號：</span>
              <span class="value">{{ currentRecord.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用教室：</span>
              <span class="value">{{ currentRecord.room }}</span>
            </div>
            <div class="detail-item">
              <span class="label">借用時間：</span>
              <span class="value">{{ currentRecord.date }} {{ currentRecord.time }}</span>
            </div>
            <div class="reason-text">
              <h4>駁回原因：</h4>
              <p>{{ currentRecord.rejectReason || '管理員介面傳送過來文字' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認操作彈出視窗 -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-modal-content">
          <p class="confirm-title">
            {{
              confirmType === 'return'
                ? `確定要歸還 ${confirmRecord?.room} 的借用嗎？`
                : `確定要取消 ${confirmRecord?.room} 的申請嗎？`
            }}
          </p>
          <div class="confirm-actions">
            <button
              class="confirm-btn cancel-btn"
              @click="closeConfirmModal"
              :disabled="isProcessing"
            >
              取消
            </button>
            <button
              class="confirm-btn ok-btn"
              :class="{
                'btn-danger': confirmType === 'cancel',
                'btn-primary': confirmType === 'return',
              }"
              @click="handleConfirm"
              :disabled="isProcessing"
            >
              {{ isProcessing ? '處理中...' : '確定' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.records-view {
  max-width: 1000px;
  margin: 40px auto;
  color: #666;
}
h1 {
  color: #666;
  font-weight: bold;
}
.records-view h1 {
  font-size: 30px;
  margin-bottom: 20px;
}
/* === 桌機/手機切換 === */
.desktop-only {
  display: table;
}
.mobile-only {
  display: none;
}

.record-container {
  margin: auto;
  margin-top: 40px;
  background-color: #ffffff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 30px;
  max-width: 1200px;
  font-family: Arial, sans-serif;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.record-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 16px;
}

.record-table th {
  background-color: #f8f9fa;
  color: #555;
  padding: 18px 12px;
  font-weight: bold;
  font-size: 17px;
  border-bottom: 2px solid #dee2e6;
}

.record-table td {
  padding: 20px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.record-table tr:hover {
  background-color: #f8f9fa;
}

/* 狀態標籤 */
.status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  white-space: nowrap; /* 避免換行 */
}
.status-gray {
  background-color: #e9ecef;
  color: #6c757d;
}
.status-red {
  background-color: #f8d7da;
  color: #721c24;
}
.status-green {
  background-color: #d1eddd;
  color: #155724;
}
.status-yellow {
  background-color: #fff3cd;
  color: #856404;
}

/* 按鈕樣式 */
.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  margin: 2px;
  transition: all 0.3s ease;
}
.btn-blue {
  background-color: #cfe2ff;
  color: #2c3e50;
}
.btn-blue:hover {
  background-color: #b6d4fe;
  transform: translateY(-1px);
}

.btn-purple {
  background-color: #7d27ff;
  color: #fff;
}
.btn-purple:hover {
  background-color: #b685ff;
  transform: translateY(-1px);
}

.btn-orange {
  background-color: #ff9900;
  color: #fff;
}
.btn-orange:hover {
  background-color: #ffc978;
  transform: translateY(-1px);
}

.btn-red {
  background-color: #ff0019;
  color: #fff;
}
.btn-red:hover {
  background-color: #ef9a9a;
  transform: translateY(-1px);
}

/* 彈出視窗樣式 */
.modal-overlay {
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
}

.modal-content {
  background-color: white;
  border-radius: 15px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  border-radius: 15px 15px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
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
  color: #333;
}

.modal-body {
  padding: 30px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
  border-bottom: 2px solid #007bff;
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

.reason-text {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
  border-radius: 0 8px 8px 0;
}

.reason-text h4 {
  color: #c53030;
  margin-bottom: 10px;
  font-size: 18px;
}

.reason-text p {
  color: #2d3748;
  line-height: 1.6;
  font-size: 16px;
  margin: 0;
}

/* 手機板 RWD */
@media (max-width: 768px) {
  .records-view {
    margin: 20px 15px;
  }
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: block;
  }
}

/* === 手機卡片樣式 === */
.record-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header .room {
  font-weight: bold;
  font-size: 16px;
}

.card-body p {
  margin: 4px 0;
  font-size: 14px;
}

.card-footer {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.card-footer .btn {
  flex: 1 1 auto;
  text-align: center;
}

/* 確認彈出視窗樣式 */
.confirm-modal {
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
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

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.confirm-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.confirm-btn.cancel-btn {
  background-color: #e5e7eb;
  color: #4b5563;
}

.confirm-btn.cancel-btn:hover {
  background-color: #d1d5db;
}

.confirm-btn.ok-btn.btn-primary {
  background-color: #3b82f6;
  color: #fff;
}

.confirm-btn.ok-btn.btn-primary:hover {
  background-color: #2563eb;
}

.confirm-btn.ok-btn.btn-danger {
  background-color: #ef4444;
  color: #fff;
}

.confirm-btn.ok-btn.btn-danger:hover {
  background-color: #dc2626;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
