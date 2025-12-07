<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const bookingId = route.query.id // 從網址取得 id
const requestData = ref(null)
const isLoading = ref(true)
const comment = ref('') // 老師的意見

// 1. 畫面載入時，跟後端要資料
onMounted(async () => {
  if (!bookingId) {
    alert('無效的連結 (缺少 ID)')
    isLoading.value = false
    return
  }
  try {
    // 呼叫我們剛寫好的後端 API
    const res = await fetch(`/api/borrow/${bookingId}`)
    const json = await res.json()

    if (json.success) {
      requestData.value = json.data
    } else {
      alert('讀取失敗: ' + json.message)
    }
  } catch (e) {
    console.error(e)
    alert('連線錯誤，無法取得資料')
  } finally {
    isLoading.value = false
  }
})

// 2. 老師按「核准」或「退回」
const handleSignOff = async (status) => {
  const actionText = status === 'APPROVED' ? '核准' : '退回'
  if (!confirm(`確定要${actionText}這筆申請嗎？`)) return

  try {
    const res = await fetch('/api/signoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: status, // 傳送 APPROVED 或 REJECTED
        comment: comment.value,
      }),
    })

    const json = await res.json()

    if (json.success) {
      alert(json.message)
      // 重新整理頁面以更新狀態
      window.location.reload()
    } else {
      alert('處理失敗: ' + json.error)
    }
  } catch (e) {
    console.error(e)
    alert('系統錯誤，請稍後再試')
  }
}
</script>

<template>
  <div class="signoff-container">
    <h1>活動簽核 - 老師簽核</h1>

    <div v-if="isLoading" class="loading">資料載入中...</div>

    <div v-else-if="requestData">
      <div class="info-grid">
        <div class="field">
          <label>活動名稱</label>
          <div class="value">{{ requestData.activity_name }}</div>
        </div>
        <div class="field">
          <label>申請人 Email</label>
          <div class="value">{{ requestData.user_email }}</div>
        </div>
        <div class="field">
          <label>借用教室</label>
          <div class="value">{{ requestData.classroom }}</div>
        </div>
        <div class="field">
          <label>借用時間</label>
          <div class="value">
            {{ new Date(requestData.borrow_date).toLocaleDateString() }}
            {{ requestData.start_time }} - {{ requestData.end_time }}
          </div>
        </div>
      </div>

      <div class="comment-section">
        <label>簽核意見 / 退回理由：</label>
        <textarea
          v-model="comment"
          placeholder="請輸入您的意見 (選填)"
          :disabled="requestData.status !== 'PENDING'"
        ></textarea>
      </div>

      <div class="action-area">
        <div v-if="requestData.status !== 'PENDING'" class="status-message">
          <h2 :class="requestData.status">
            此申請單已{{ requestData.status === 'APPROVED' ? '核准' : '退回' }}
          </h2>
        </div>

        <div v-else class="btn-group">
          <button class="btn-approve" @click="handleSignOff('APPROVED')">核准</button>
          <button class="btn-reject" @click="handleSignOff('REJECTED')">退回申請人</button>
        </div>
      </div>
    </div>

    <div v-else class="error-msg">找不到此申請單資料。</div>
  </div>
</template>

<style scoped>
.signoff-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.field label {
  display: block;
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
}

.field .value {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 5px;
  color: #333;
  font-size: 16px;
}

.comment-section textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;
}

.action-area {
  margin-top: 30px;
  text-align: center;
}

.btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

button {
  padding: 12px 40px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s;
}

button:hover {
  opacity: 0.9;
}

.btn-approve {
  background-color: #28a745;
  color: white;
}
.btn-reject {
  background-color: #dc3545;
  color: white;
}

.status-message h2 {
  font-size: 24px;
}
.APPROVED {
  color: #28a745;
}
.REJECTED {
  color: #dc3545;
}
.loading,
.error-msg {
  text-align: center;
  font-size: 18px;
  color: #666;
}
</style>
