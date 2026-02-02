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
    <div class="spinner"></div>
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
              <button class="btn btn-delete" @click="openConfirm(item)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty-state">目前沒有黑名單資料</p>
    </section>
  </template>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <p>確定要刪除此黑名單項目?</p>
      <!-- 顯示要刪除的項目細節 -->
      <div v-if="deleteItem" class="modal-content">
        <p style="color: #333; font-weight: 500">使用者：{{ deleteItem.user_name }}</p>
        <p style="color: #666; font-size: 14px; margin-top: 8px">原因：{{ deleteItem.reason }}</p>
      </div>
      <div class="modal-actions">
        <button class="cancel" @click="closeModal" :disabled="isSubmitting">取消</button>
        <button class="confirm" @click="confirmDelete" :disabled="isSubmitting">
          {{ isSubmitting ? '刪除中...' : '確定刪除' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.page-container {
  max-width: 1000px;
  margin: 40px auto;
  color: #666;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

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

/* Card/List Section */
.list {
  background-color: #fff;
  padding: 25px 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
}

.list h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

/* Button Styles */
.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover {
  background-color: #fecaca;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  max-width: 420px;
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

.modal > p:first-child {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.modal-content {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 10px;
  margin: 15px 0 20px;
  text-align: left;
  border-left: 4px solid #dc2626;
}

.modal-content p {
  margin: 5px 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions .cancel {
  background-color: #e5e7eb;
  color: #4b5563;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions .cancel:hover {
  background-color: #d1d5db;
}

.modal-actions .confirm {
  background-color: #dc2626;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions .confirm:hover {
  background-color: #b91c1c;
}

.modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    margin: 20px 15px;
  }

  .list {
    padding: 20px;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  th,
  td {
    padding: 12px 10px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
