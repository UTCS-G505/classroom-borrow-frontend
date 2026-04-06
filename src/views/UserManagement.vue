<script setup>
import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import adminApi from '../api/admin.api.js'

const toastStore = useToastStore()

const activeTab = ref('users') // 'users' or 'blacklist'

const users = ref([])
const blacklist = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)

const ROLE_OPTIONS = [
  { value: 0, label: '管理員 (ADMIN)' },
  { value: 1, label: '行政人員 (OFFICER)' },
  { value: 2, label: '主任 (DIRECTOR)' },
  { value: 3, label: '教師 (TEACHER)' },
  { value: 4, label: '學生 (STUDENT)' },
  { value: 5, label: '單位用戶 (UT_USER)' },
  { value: 6, label: '訪客 (GUEST)' },
]

function getRoleLabel(roleValue) {
  const role = ROLE_OPTIONS.find((r) => r.value === roleValue)
  return role ? role.label : '未知'
}

async function fetchData() {
  isLoading.value = true
  try {
    const [usersRes, blacklistRes] = await Promise.all([
      adminApi.getAllUsers(),
      adminApi.getAllBlacklist(),
    ])

    users.value = usersRes.data.map((u) => ({
      ...u,
      currentRole: u.role, // For tracking changes before saving
    }))

    blacklist.value = blacklistRes.data.map((item) => ({
      id: item.blacklist_id,
      user_id: item.user_id,
      user_name: item.user_name || '未知',
      user_email: item.user_email || '-',
      reason: item.reason,
      created_at: item.created_at,
      expired_at: item.expired_at,
    }))
  } catch (error) {
    console.error('Failed to fetch data:', error)
    toastStore.showToast('無法載入資料', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// ----- Role Updates -----
const showRoleModal = ref(false)
const targetUser = ref(null)
const targetRole = ref(null)

const confirmRoleChange = (user, newRoleValue) => {
  targetUser.value = user
  targetRole.value = newRoleValue
  showRoleModal.value = true
}

const cancelRoleChange = () => {
  // Reset select to current role
  if (targetUser.value) {
    targetUser.value.currentRole = targetUser.value.role
  }
  targetUser.value = null
  targetRole.value = null
  showRoleModal.value = false
}

const saveRoleChange = async () => {
  if (!targetUser.value || targetRole.value === null) return
  isSubmitting.value = true
  try {
    await adminApi.updateUserRole(targetUser.value.user_id, targetRole.value)
    targetUser.value.role = targetRole.value // update saved state
    toastStore.showToast('權限更新成功', 'success')
  } catch (err) {
    console.error(err)
    toastStore.showToast('權限更新失敗', 'error')
    targetUser.value.currentRole = targetUser.value.role // rollback
  } finally {
    isSubmitting.value = false
    showRoleModal.value = false
    targetUser.value = null
    targetRole.value = null
  }
}

// ----- Blacklist Management -----
const showDeleteConfirm = ref(false)
const deleteItem = ref(null)

const openDeleteConfirm = (item) => {
  deleteItem.value = item
  showDeleteConfirm.value = true
}

const confirmDeleteBlacklist = async () => {
  if (!deleteItem.value) return
  isSubmitting.value = true
  try {
    const userId = deleteItem.value.user_id
    await adminApi.removeFromBlacklist(userId)
    // Update local state instead of refetching
    blacklist.value = blacklist.value.filter((item) => item.id !== deleteItem.value.id)
    const u = users.value.find((u) => u.user_id === userId)
    if (u) {
      u.blacklist_id = null
      u.blacklist_reason = null
      u.blacklist_expired_at = null
    }
    toastStore.showToast('已從黑名單移除', 'success')
    showDeleteConfirm.value = false
    deleteItem.value = null
  } catch (error) {
    console.error('Failed to remove from blacklist:', error)
    toastStore.showToast('移除失敗: ' + (error.response?.data?.error || '未知錯誤'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// ----- Add Blacklist Modal -----
const showAddBlacklistModal = ref(false)
const addBlacklistUser = ref(null)
const addBlacklistReason = ref('')
const addBlacklistExpiry = ref('')

const openAddBlacklist = (user) => {
  addBlacklistUser.value = user
  addBlacklistReason.value = ''
  // default expiry to +30 days
  const d = new Date()
  d.setDate(d.getDate() + 30)
  addBlacklistExpiry.value = d.toISOString().split('T')[0]
  showAddBlacklistModal.value = true
}

const submitAddBlacklist = async () => {
  if (!addBlacklistUser.value || !addBlacklistReason.value || !addBlacklistExpiry.value) {
    toastStore.showToast('請填寫完整資訊', 'error')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      user_id: addBlacklistUser.value.user_id,
      reason: addBlacklistReason.value,
      expired_at: addBlacklistExpiry.value,
    }
    await adminApi.addToBlacklist(payload)
    toastStore.showToast('已加入黑名單', 'success')
    showAddBlacklistModal.value = false
    addBlacklistUser.value = null
    fetchData() // reload all data to get updated joins
  } catch (err) {
    toastStore.showToast('加入黑名單失敗', 'error')
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

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
      <div class="header-container">
        <h3>用戶與黑名單管理</h3>
        <div class="tabs">
          <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
            所有用戶
          </button>
          <button :class="{ active: activeTab === 'blacklist' }" @click="activeTab = 'blacklist'">
            黑名單列表
          </button>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <table v-if="users.length">
          <thead>
            <tr>
              <th>姓名</th>
              <th>Email</th>
              <th>系所</th>
              <th>註冊日</th>
              <th>狀態</th>
              <th style="min-width: 150px">角色權限</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.department || '-' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <span v-if="user.blacklist_id" class="badge badge-error">已設黑名單</span>
                <span v-else class="badge badge-success">正常</span>
              </td>
              <td>
                <select
                  v-model="user.currentRole"
                  @change="confirmRoleChange(user, user.currentRole)"
                  class="role-select"
                >
                  <option v-for="opt in ROLE_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </td>
              <td>
                <button
                  v-if="!user.blacklist_id"
                  class="btn btn-warning"
                  @click="openAddBlacklist(user)"
                >
                  設黑名單
                </button>
                <button
                  v-else
                  class="btn btn-primary"
                  @click="
                    openDeleteConfirm({
                      id: user.blacklist_id,
                      user_id: user.user_id,
                      user_name: user.name,
                      reason: user.blacklist_reason,
                    })
                  "
                >
                  解除黑名單
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-state">目前沒有用戶資料</p>
      </div>

      <!-- Blacklist Tab -->
      <div v-if="activeTab === 'blacklist'" class="tab-content">
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
                <button class="btn btn-delete" @click="openDeleteConfirm(item)">解除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-state">目前沒有黑名單資料</p>
      </div>
    </section>
  </template>

  <!-- Delete Blacklist Modal -->
  <div v-if="showDeleteConfirm" class="modal-overlay">
    <div class="modal">
      <p>確定要解除此黑名單項目?</p>
      <div v-if="deleteItem" class="modal-content">
        <p style="color: #333; font-weight: 500">使用者：{{ deleteItem.user_name }}</p>
        <p style="color: #666; font-size: 14px; margin-top: 8px">原因：{{ deleteItem.reason }}</p>
      </div>
      <div class="modal-actions">
        <button class="cancel" @click="showDeleteConfirm = false" :disabled="isSubmitting">
          取消
        </button>
        <button class="confirm" @click="confirmDeleteBlacklist" :disabled="isSubmitting">
          {{ isSubmitting ? '處理中...' : '確定解除' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Role Change Modal -->
  <div v-if="showRoleModal" class="modal-overlay">
    <div class="modal">
      <p>確定要更改此用戶的權限?</p>
      <div v-if="targetUser" class="modal-content">
        <p style="color: #333; font-weight: 500">使用者：{{ targetUser.name }}</p>
        <p style="color: #666; font-size: 14px; margin-top: 8px">
          變更為：<strong style="color: #0b6bc8">{{ getRoleLabel(targetRole) }}</strong>
        </p>
      </div>
      <div class="modal-actions">
        <button class="cancel" @click="cancelRoleChange" :disabled="isSubmitting">取消</button>
        <button
          class="confirm"
          @click="saveRoleChange"
          style="background-color: #0b6bc8"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '處理中...' : '確定變更' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Add to Blacklist Modal -->
  <div v-if="showAddBlacklistModal" class="modal-overlay">
    <div class="modal form-modal">
      <p>加入黑名單</p>
      <div
        v-if="addBlacklistUser"
        class="modal-content form-content"
        style="border-left: 4px solid #f59e0b"
      >
        <p style="color: #333; font-weight: 500; margin-bottom: 12px">
          目標用戶：{{ addBlacklistUser.name }}
        </p>

        <div class="form-group">
          <label>違規原因</label>
          <input
            type="text"
            v-model="addBlacklistReason"
            placeholder="請輸入原因"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>到期日期</label>
          <input type="date" v-model="addBlacklistExpiry" class="form-input" />
        </div>
      </div>
      <div class="modal-actions">
        <button class="cancel" @click="showAddBlacklistModal = false" :disabled="isSubmitting">
          取消
        </button>
        <button
          class="confirm"
          @click="submitAddBlacklist"
          style="background-color: #f59e0b"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '處理中...' : '確定加入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container */
.page-container {
  max-width: 1100px;
  margin: 40px auto;
  color: #666;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.tabs {
  display: flex;
  gap: 10px;
}

.tabs button {
  padding: 8px 16px;
  border: none;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button:hover {
  background-color: #e2e8f0;
}

.tabs button.active {
  background-color: #0b6bc8;
  color: white;
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
  margin: 0;
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
  border-bottom: 2px solid #dee2e6;
}
td {
  padding: 12px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  color: #444;
}
tbody tr:hover {
  background-color: #f8f9fa;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

/* Form styles */
.role-select {
  padding: 6px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}
.role-select:focus {
  border-color: #0b6bc8;
  box-shadow: 0 0 0 2px rgba(11, 107, 200, 0.2);
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
.badge-success {
  background-color: #dcfce7;
  color: #16a34a;
}
.badge-error {
  background-color: #fee2e2;
  color: #dc2626;
}

.form-group {
  margin-bottom: 12px;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #475569;
}
.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

/* Button Styles */
.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 4px;
}

.btn-delete {
  background-color: #fee2e2;
  color: #dc2626;
}
.btn-delete:hover {
  background-color: #fecaca;
}

.btn-warning {
  background-color: #fef3c7;
  color: #d97706;
}
.btn-warning:hover {
  background-color: #fde68a;
}

.btn-primary {
  background-color: #e0f2fe;
  color: #0284c7;
}
.btn-primary:hover {
  background-color: #bae6fd;
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
.form-modal {
  max-width: 500px;
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
.form-content {
  background-color: transparent;
  border: none !important;
  padding: 0;
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
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.modal-actions .cancel:hover {
  background-color: #d1d5db;
}
.modal-actions .confirm {
  background-color: #dc2626;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.modal-actions .confirm:hover {
  filter: brightness(0.9);
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
