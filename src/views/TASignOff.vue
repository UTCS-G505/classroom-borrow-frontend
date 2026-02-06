<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/api/axios'
import { useToastStore } from '@/stores/toast'

// Route & State
const route = useRoute()
const toastStore = useToastStore()
const bookingId = route.query.id

const requestData = ref(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const comment = ref('')

// Confirm Modal State
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// Computed status properties
const isTeacherApproved = computed(() => requestData.value?.status === '教師核准')
const isApproved = computed(() => requestData.value?.status === '核准')
const isRejected = computed(() => requestData.value?.status === '退件')
const isPending = computed(() => requestData.value?.status === '審核中')

const formattedBorrowTime = computed(() => {
  if (!requestData.value) return ''
  const { start_date, end_date, start_time, end_time } = requestData.value

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }

  const sDate = formatDate(start_date)
  const eDate = formatDate(end_date)
  // Ensure time is in HH:mm format
  const sTime = start_time?.substring(0, 5)
  const eTime = end_time?.substring(0, 5)

  if (sDate === eDate) {
    return `${sDate} <br /> ${sTime} - ${eTime}`
  } else {
    return `${sDate} ${sTime} <br /> - <br /> ${eDate} ${eTime}`
  }
})

// API Functions
async function fetchBookingData() {
  if (!bookingId) {
    isLoading.value = false
    return
  }

  try {
    const data = await apiClient.get(`/bookings/${bookingId}`)

    if (data.status === 200) {
      requestData.value = data.data[0]
    } else {
      toastStore.showToast('找不到資料', 'error')
    }
  } catch (error) {
    console.error('Failed to fetch booking data:', error)
    toastStore.showToast('連線錯誤', 'error')
  } finally {
    isLoading.value = false
  }
}

function openConfirmModal(status) {
  const actionText = status === '核准' ? '最終核准' : '退回申請'
  confirmAction.value = status
  confirmMessage.value = `確定要 ${actionText} 嗎？`
  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
  confirmAction.value = null
}

async function confirmSignOff() {
  if (confirmAction.value) {
    await handleSignOff(confirmAction.value)
    closeConfirmModal()
  }
}

async function handleSignOff(status) {
  isSubmitting.value = true

  try {
    const data = await apiClient.post(`/bookings/ta-signoff`, {
      id: bookingId,
      status: status,
      reject_reason: comment.value, // Backend expects 'reject_reason' for TA
    })

    if (data.status === 200) {
      toastStore.showToast(data.data.message, 'success')
      window.location.reload()
    } else {
      toastStore.showToast('失敗: ' + data.data.error, 'error')
    }
  } catch (error) {
    console.error('Sign-off failed:', error)
    toastStore.showToast('系統錯誤', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(fetchBookingData)
</script>

<template>
  <div class="signoff-container">
    <h2 class="title">活動簽核 - 助教/系辦</h2>

    <div v-if="isLoading">載入中...</div>

    <div v-else-if="requestData" class="content">
      <div class="row">
        <div class="col">
          <label>活動名稱</label>
          <div class="value">{{ requestData.event_name }}</div>
        </div>
        <div class="col">
          <label>申請人 (Email)</label>
          <div class="value">{{ requestData.borrower_email }}</div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label>借用教室</label>
          <div class="value">{{ requestData.classroom_id }}</div>
        </div>
        <div class="col">
          <label>借用時間</label>
          <div class="value" v-html="formattedBorrowTime"></div>
        </div>
      </div>

      <!-- Teacher Approved: Show TA sign-off form -->
      <div v-if="isTeacherApproved" class="signoff-form">
        <div class="info-box">
          <p>✅ 指導老師已核准，請助教進行最終確認。</p>
        </div>

        <div class="input-group">
          <label>助教備註 / 退回理由：</label>
          <textarea
            v-model="comment"
            placeholder="請輸入備註..."
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="btn-group">
          <button class="btn-approve" :disabled="isSubmitting" @click="openConfirmModal('核准')">
            {{ isSubmitting ? '處理中...' : '最終核准' }}
          </button>
          <button class="btn-reject" :disabled="isSubmitting" @click="openConfirmModal('退件')">
            {{ isSubmitting ? '處理中...' : '退回' }}
          </button>
        </div>
      </div>

      <!-- Approved status -->
      <div v-else-if="isApproved" class="status-msg success">
        <h2>此申請單已核准</h2>
        <p>流程已結案</p>
      </div>

      <!-- Rejected status -->
      <div v-else-if="isRejected" class="status-msg error">
        <h2>此申請單已退回</h2>
      </div>

      <!-- Pending status -->
      <div v-else-if="isPending" class="status-msg pending">
        <h2>等待指導老師簽核中</h2>
        <p>尚未輪到助教簽核</p>
      </div>

      <!-- Other status -->
      <div v-else class="status-msg">
        <h2>狀態：{{ requestData.status }}</h2>
      </div>
    </div>
    <div v-else>找不到此申請單資料</div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <p class="modal-title">{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="closeConfirmModal" :disabled="isSubmitting">
            取消
          </button>
          <button class="modal-btn confirm" @click="confirmSignOff" :disabled="isSubmitting">
            {{ isSubmitting ? '處理中...' : '確定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signoff-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.col {
  flex: 1;
  min-width: 200px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}
.value {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #eee;
  color: #333;
}
.info-box {
  background-color: #e3f2fd;
  color: #0d47a1;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}
.input-group {
  margin-top: 20px;
}
textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}
.btn-group {
  margin-top: 30px;
  display: flex;
  gap: 20px;
  justify-content: center;
}
button {
  padding: 12px 40px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: opacity 0.2s;
  color: white;
}
button:hover {
  opacity: 0.9;
}
.btn-approve {
  background-color: #28a745;
}
.btn-reject {
  background-color: #dc3545;
}
.status-msg {
  margin-top: 40px;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}
.status-msg.success h2 {
  color: #28a745;
  margin: 0;
}
.status-msg.error h2 {
  color: #dc3545;
  margin: 0;
}
.status-msg.pending h2 {
  color: #f0ad4e;
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal {
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

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background-color: #e5e7eb;
  color: #4b5563;
}

.modal-btn.cancel:hover {
  background-color: #d1d5db;
}

.modal-btn.confirm {
  background-color: #3b82f6;
  color: #fff;
}

.modal-btn.confirm:hover {
  background-color: #2563eb;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
