<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const bookingId = route.query.id
const requestData = ref(null)
const isLoading = ref(true)
const comment = ref('')

// 1. 載入資料
onMounted(async () => {
  if (!bookingId) return
  try {
    const baseUrl = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${baseUrl}/api/borrow/${bookingId}`)
    const json = await res.json()
    if (json.success) {
      requestData.value = json.data
    } else {
      alert('找不到資料')
    }
  } catch (e) {
    console.error(e)
    alert('連線錯誤')
  } finally {
    isLoading.value = false
  }
})

// 2. 助教簽核動作
const handleSignOff = async (status) => {
  const actionText = status === 'APPROVED' ? '最終核准' : '退回申請'
  if (!confirm(`確定要 ${actionText} 嗎？`)) return

  try {
    const res = await fetch('/api/ta-signoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: status,
        comment: comment.value,
      }),
    })
    const json = await res.json()
    if (json.success) {
      alert(json.message)
      window.location.reload()
    } else {
      alert('失敗: ' + json.error)
    }
  } catch (e) {
    console.error(e)
    alert('系統錯誤')
  }
}
</script>

<template>
  <div class="signoff-container">
    <h2 class="title">活動簽核 - 助教/系辦</h2>

    <div v-if="isLoading">載入中...</div>

    <div v-else-if="requestData" class="content">
      <div class="row">
        <div class="col">
          <label>活動名稱</label>
          <div class="value">{{ requestData.activity_name }}</div>
        </div>
        <div class="col">
          <label>申請人 (Email)</label>
          <div class="value">
            {{ requestData.applicant_name || '未填寫' }}
            <span class="sub-text">({{ requestData.user_email }})</span>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label>借用教室</label>
          <div class="value">{{ requestData.classroom }}</div>
        </div>
        <div class="col">
          <label>借用時間</label>
          <div class="value">
            {{ requestData.borrow_date }} <br />
            {{ requestData.start_time }} - {{ requestData.end_time }}
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-small">
          <label>參與人數</label>
          <div class="value">{{ requestData.participant_count || 0 }} 人</div>
        </div>
        <div class="col-large">
          <label>活動說明</label>
          <div class="value description-box">
            {{ requestData.description || '無詳細說明' }}
          </div>
        </div>
      </div>

      <div v-if="requestData.status === 'TEACHER_APPROVED'">
        <div class="info-box">
          <p>✅ 指導老師已核准，請助教進行最終確認。</p>
        </div>

        <div class="input-group">
          <label>助教備註 / 退回理由：</label>
          <textarea v-model="comment" placeholder="請輸入備註..."></textarea>
        </div>

        <div class="btn-group">
          <button class="btn-approve" @click="handleSignOff('APPROVED')">最終核准</button>
          <button class="btn-reject" @click="handleSignOff('REJECTED')">退回</button>
        </div>
      </div>

      <div v-else-if="requestData.status === 'APPROVED'" class="status-msg success">
        <h2>此申請單已核准</h2>
        <p>流程已結案</p>
      </div>

      <div v-else-if="requestData.status === 'REJECTED'" class="status-msg error">
        <h2>此申請單已退回</h2>
      </div>

      <div v-else-if="requestData.status === 'PENDING'" class="status-msg pending">
        <h2>等待指導老師簽核中</h2>
        <p>尚未輪到助教簽核</p>
      </div>
    </div>
    <div v-else>找不到此申請單資料</div>
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
.col-small {
  flex: 0 0 150px;
}
.col-large {
  flex: 2;
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
.sub-text {
  font-size: 0.9em;
  color: #888;
  margin-left: 5px;
}
.description-box {
  min-height: 60px;
  white-space: pre-wrap;
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
  height: 80px;
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
  padding: 12px 30px;
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

/* 狀態樣式 */
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
</style>
