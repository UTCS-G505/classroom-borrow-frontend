<script setup>
import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import adminApi from '../api/admin.api.js'

const toastStore = useToastStore()

const blacklist = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)

// Fetch blacklist from backend
async function fetchBlacklist() {
  isLoading.value = true
  try {
    const response = await adminApi.getAllBlacklist()
    blacklist.value = response.data.map((item) => ({
      id: item.blacklist_id,
      user_id: item.user_id,
      user_name: item.user_name || '未知',
      user_email: item.user_email || '-',
      reason: item.reason,
      created_at: item.created_at,
      expired_at: item.expired_at,
    }))
  } catch (error) {
    console.error('Failed to fetch blacklist:', error)
    toastStore.showToast('無法載入黑名單資料', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBlacklist()
})

// 控制 modal
const showModal = ref(false)
const deleteItem = ref(null)

//打開確認框
const openConfirm = (item) => {
  deleteItem.value = item
  showModal.value = true
}

//確認刪除
const confirmDelete = async () => {
  if (!deleteItem.value) return

  isSubmitting.value = true
  try {
    await adminApi.removeFromBlacklist(deleteItem.value.user_id)
    blacklist.value = blacklist.value.filter((item) => item.id !== deleteItem.value.id)
    toastStore.showToast('已從黑名單移除', 'success')
    closeModal()
  } catch (error) {
    console.error('Failed to remove from blacklist:', error)
    toastStore.showToast('移除失敗: ' + (error.response?.data?.error || '未知錯誤'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

//取消刪除
const closeModal = () => {
  showModal.value = false
  deleteItem.value = null
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return '永久'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW')
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="loading">
    <p>載入中...</p>
  </div>

  <template v-else>
    <section class="list">
      <h3>黑名單列表</h3>
      <table v-if="blacklist.length">
        <thead>
          <tr>
            <th>使用者</th>
            <th>Email</th>
            <th>原因</th>
            <th>加入日期</th>
            <th>到期日期</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in blacklist" :key="item.id">
            <td>{{ item.user_name }}</td>
            <td>{{ item.user_email }}</td>
            <td>{{ item.reason }}</td>
            <td>{{ formatDate(item.created_at) }}</td>
            <td>{{ formatDate(item.expired_at) }}</td>
            <td>
              <button @click="openConfirm(item)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>目前沒有黑名單資料</p>
    </section>
  </template>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <p>確定要刪除此黑名單項目?</p>
      <!-- 顯示要刪除的項目細節 -->
      <div v-if="deleteItem" class="modal-content">
        <p style="color: #555; margin-top: 10px">【使用者：{{ deleteItem.user_name }}】</p>
        <p style="color: #888; font-size: 14px">原因：{{ deleteItem.reason }}</p>
      </div>
      <div class="modal-actions">
        <button class="cancel" @click="closeModal" :disabled="isSubmitting">取消</button>
        <button class="confirm" @click="confirmDelete" :disabled="isSubmitting">
          {{ isSubmitting ? '刪除中...' : '確定' }}
        </button>
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

.list {
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

button {
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background-color: #dcdddf;
  color: #666;
  cursor: pointer;
  margin-right: 5px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.confirm {
  background-color: #e74c3c;
  color: #fff;
}

button.confirm:hover {
  background-color: #c0392b;
}

button.cancel {
  background-color: #ddd;
  margin-right: 20px;
  margin-top: 20px;
}

button.cancel:hover {
  background-color: #bbb;
}

/* Modal 樣式 */
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
}

.modal {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-content {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  text-align: left;
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
