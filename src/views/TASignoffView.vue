<template>
  <div class="container">
    <h2>助教覆核頁面</h2>
    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="request" class="card">
      <h3>申請單 #{{ request.request_id }}</h3>
      <p><strong>活動名稱：</strong> {{ request.event_name }}</p>
      <p><strong>申請人：</strong> {{ request.borrower_email }}</p>
      <p><strong>教室：</strong> {{ request.classroom_id }}</p>
      <p><strong>日期：</strong> {{ formatDate(request.start_date) }}</p>
      <p><strong>時間：</strong> {{ request.start_time }} - {{ request.end_time }}</p>
      <p><strong>事由：</strong> {{ request.reason }}</p>
      <p><strong>目前狀態：</strong> {{ request.status }}</p>

      <!-- 只有狀態是 '教師核准' 才輪到助教簽 -->
      <div v-if="request.status === '教師核准'" class="actions">
        <button @click="handleSignoff('核准')" class="btn-approve">核准</button>
        <button @click="showRejectInput = true" class="btn-reject">退件</button>
      </div>
      <div v-else class="status-msg">此申請單狀態為：{{ request.status }}，非助教覆核階段。</div>

      <div v-if="showRejectInput" class="reject-area">
        <textarea v-model="rejectReason" placeholder="請輸入退件理由..." rows="3"></textarea>
        <div class="reject-actions">
          <button @click="handleSignoff('退件')" class="btn-confirm-reject">確認退件</button>
          <button @click="showRejectInput = false" class="btn-cancel">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { bookingsApi } from '@/api/bookings.api'

const route = useRoute()
const toastStore = useToastStore()
const request = ref(null)
const loading = ref(true)
const error = ref('')

const showRejectInput = ref(false)
const rejectReason = ref('')

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

const fetchRequest = async () => {
  const id = route.query.id
  if (!id) {
    error.value = '無效的申請單 ID'
    loading.value = false
    return
  }
  try {
    const res = await bookingsApi.getBookingById(id)
    if (res.data && res.data.length > 0) {
      request.value = res.data[0]
    } else {
      error.value = '找不到該申請單'
    }
  } catch (err) {
    console.error(err)
    error.value = '載入失敗'
  } finally {
    loading.value = false
  }
}

const handleSignoff = async (status) => {
  if (status === '退件' && !rejectReason.value) {
    toastStore.showToast('請輸入退件理由', 'warning')
    return
  }

  try {
    await bookingsApi.taSignoff({
      id: request.value.public_id,
      status: status,
      reject_reason: rejectReason.value, // Backend expects 'reject_reason' for TA
    })
    toastStore.showToast('簽核完成', 'success')
    location.reload()
  } catch (err) {
    console.error(err)
    toastStore.showToast('簽核失敗: ' + (err.response?.data?.message || err.message), 'error')
  }
}

onMounted(() => {
  fetchRequest()
})
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.card {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background: #f9f9f9;
}
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.btn-approve {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
}
.btn-reject {
  background: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
}
.reject-area {
  margin-top: 20px;
  border-top: 1px dashed #ccc;
  padding-top: 20px;
}
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}
.reject-actions {
  display: flex;
  gap: 10px;
}
.btn-confirm-reject {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 4px;
}
.btn-cancel {
  background: #aaa;
  color: white;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 4px;
}
.error {
  color: red;
  font-weight: bold;
}
.status-msg {
  margin-top: 20px;
  padding: 10px;
  background: #e0e0e0;
  border-radius: 4px;
}
</style>
