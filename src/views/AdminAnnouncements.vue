<template>
  <div class="page-container">
    <div class="header-section">
      <h2 class="page-title">公告管理</h2>
      <button class="btn btn-primary" @click="openModal()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="me-1"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新增公告
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <div>Loading...</div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Announcements Table -->
    <div v-if="!loading && announcements.length > 0" class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 25%">標題</th>
              <th style="width: 35%">內容摘要</th>
              <th style="width: 15%">發布日期</th>
              <th style="width: 15%">過期日期</th>
              <th style="width: 5%" class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in announcements" :key="item.announcement_id">
              <td>{{ item.announcement_id }}</td>
              <td class="fw-bold">{{ item.title }}</td>
              <td class="text-truncate">{{ item.content }}</td>
              <td>{{ formatDate(item.created_at) }}</td>
              <td>
                <span :class="isExpired(item.expired_at) ? 'text-danger fw-bold' : ''">
                  {{ item.expired_at ? formatDate(item.expired_at) : '-' }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button class="btn-icon" @click="openModal(item)" title="編輯">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    class="btn-icon btn-icon-danger"
                    @click="confirmDelete(item)"
                    title="刪除"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      ></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="empty-icon"
      >
        <path d="m3 11 18-5v12L3 14v-3z"></path>
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
      </svg>
      <p>目前沒有公告</p>
    </div>

    <!-- Custom Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '編輯公告' : '新增公告' }}</h3>
          <button type="button" class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="title">標題 <span class="text-danger">*</span></label>
              <input type="text" id="title" v-model="form.title" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="content">內容 <span class="text-danger">*</span></label>
              <textarea
                id="content"
                v-model="form.content"
                rows="5"
                class="form-control"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="expired_at">過期日期 (選填)</label>
              <input type="date" id="expired_at" v-model="form.expired_at" class="form-control" />
              <small class="form-text">若設定，公告將在該日期後不再顯示於首頁。</small>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-sm"></span>
                {{ isEdit ? '更新' : '新增' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../api/announcements'
import dayjs from 'dayjs'

const announcements = ref([])
const loading = ref(false)
const error = ref(null)
const submitting = ref(false)
const showModal = ref(false)

const isEdit = ref(false)
const currentId = ref(null)
const form = ref({
  title: '',
  content: '',
  expired_at: '',
})

onMounted(() => {
  fetchAnnouncements()
})

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const res = await getAnnouncements()
    announcements.value = res.data
  } catch (err) {
    console.error(err)
    error.value = '無法載入公告列表'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dayjs(dateStr).format('YYYY-MM-DD')
}

const isExpired = (dateStr) => {
  if (!dateStr) return false
  return dayjs().isAfter(dayjs(dateStr).endOf('day'))
}

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    currentId.value = item.announcement_id
    form.value = {
      title: item.title,
      content: item.content,
      expired_at: item.expired_at ? dayjs(item.expired_at).format('YYYY-MM-DD') : '',
    }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = {
      title: '',
      content: '',
      expired_at: '',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  if (!form.value.title || !form.value.content) {
    alert('請填寫標題與內容')
    return
  }

  submitting.value = true
  try {
    const payload = {
      title: form.value.title,
      content: form.value.content,
      expired_at: form.value.expired_at || null,
    }

    if (isEdit.value) {
      await updateAnnouncement(currentId.value, payload)
      alert('更新成功')
    } else {
      await createAnnouncement(payload)
      alert('新增成功')
    }
    closeModal()
    fetchAnnouncements()
  } catch (err) {
    console.error(err)
    alert('操作失敗: ' + (err.response?.data?.error || err.message))
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  if (confirm(`確定要刪除公告 "${item.title}" 嗎？\n此動作無法復原。`)) {
    try {
      await deleteAnnouncement(item.announcement_id)
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
      alert('刪除失敗')
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-icon {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-icon-danger:hover {
  background-color: #fee2e2;
  color: #ef4444;
  border-color: #fee2e2;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.text-danger {
  color: #ef4444;
}

.fw-bold {
  font-weight: 600;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

.spinner-sm {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.5;
}

/* Card & Table */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.text-truncate {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.text-right {
  text-align: right;
}

/* Actions */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Modal Overrides */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 10px;
  width: 95%;
  max-width: 600px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalFadeIn 0.2s ease-out;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
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

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
}

.btn-close:hover {
  color: #4b5563;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Forms */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
