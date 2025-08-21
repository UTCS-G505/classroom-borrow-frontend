<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 控制彈出視窗的顯示
const showDetailModal = ref(false)
const showReasonModal = ref(false)
const currentRecord = ref({})

// 狀態樣式分類函數
const statusClass = (status) => {
  switch (status) {
    case '已歸還':
      return 'status-gray'
    case '駁回':
      return 'status-red'
    case '借用中':
      return 'status-green'
    case '審核中':
      return 'status-blue'
    default:
      return 'status-gray'
  }
}

// 生成唯一編號的函數 - 縮短版本
let idCounter = 1001
const generateId = () => {
  return 'BR' + (idCounter++).toString().padStart(4, '0')
}

// 預設紀錄 - 加入編號和完整資料
const records = reactive([
  {
    id: generateId(),
    date: '2025.05.25',
    room: 'G501',
    time: '09:10 - 12:00',
    status: '已歸還',
    action: '',
    eventName: '程式設計課程',
    peopleCount: 30,
    borrowType: '單次借用',
    description: '程式設計基礎教學課程',
    borrowerName: '王小明',
    teacherName: '李教授',
    borrowerDepartment: '資訊工程系',
    teacherDepartment: '資訊工程系',
    borrowerEmail: 'wang@example.com',
    teacherEmail: 'lee@example.com',
    borrowerPhone: '0912-345-678',
    teacherPhone: '02-1234-5678',
  },
  {
    id: generateId(),
    date: '2025.06.10',
    room: 'G508',
    time: '10:10 - 12:00',
    status: '駁回',
    action: '查看原因',
    eventName: '學生會會議',
    peopleCount: 15,
    borrowType: '單次借用',
    description: '學生會定期會議討論',
    borrowerName: '陳小華',
    teacherName: '張教授',
    borrowerDepartment: '學生會',
    teacherDepartment: '學務處',
    borrowerEmail: 'chen@example.com',
    teacherEmail: 'zhang@example.com',
    borrowerPhone: '0987-654-321',
    teacherPhone: '02-8765-4321',
    rejectReason: '申請時間與其他活動衝突，請重新選擇時間段',
  },
  {
    id: generateId(),
    date: '2025.06.23',
    room: 'G312',
    time: '13:10 - 16:00',
    status: '借用中',
    action: '我要歸還',
    eventName: '社團活動',
    peopleCount: 25,
    borrowType: '單次借用',
    description: '社團幹部訓練活動',
    borrowerName: '林小美',
    teacherName: '劉教授',
    borrowerDepartment: '社團聯合會',
    teacherDepartment: '學務處',
    borrowerEmail: 'lin@example.com',
    teacherEmail: 'liu@example.com',
    borrowerPhone: '0923-456-789',
    teacherPhone: '02-2345-6789',
  },
  // 加入多次借用的範例資料
  {
    id: generateId(),
    date: '2025.08.01 至 2025.12.31',
    room: 'G509',
    time: '09:10 - 12:00',
    status: '審核中',
    action: '取消申請',
    eventName: '週會課程',
    peopleCount: 35,
    borrowType: '多次借用',
    repeatType: '每周',
    multiStartDate: '2025.08.01',
    multiEndDate: '2025.12.31',
    description: '每週定期課程教學',
    borrowerName: '王助教',
    teacherName: '李主任',
    borrowerDepartment: '電子工程系',
    teacherDepartment: '電子工程系',
    borrowerEmail: 'wang.ta@example.com',
    teacherEmail: 'lee.director@example.com',
    borrowerPhone: '0922-333-444',
    teacherPhone: '02-2222-3333',
  },
])

// 待處理的管理員操作佇列（模擬後端處理）
const adminQueue = reactive([])

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

// 歸還操作
const returnItem = (record) => {
  if (confirm(`確定要歸還 ${record.room} 的借用嗎？`)) {
    // 加入管理員處理佇列
    adminQueue.push({
      type: 'return',
      recordId: record.id,
      timestamp: new Date().toISOString(),
      data: { ...record },
    })

    // 更新狀態
    record.status = '確認歸還中'
    record.action = ''

    alert('歸還申請已送出，等待管理員確認')
    console.log('管理員處理佇列:', adminQueue)
  }
}

// 取消申請
const cancelApplication = (record) => {
  if (confirm(`確定要取消 ${record.room} 的申請嗎？`)) {
    // 加入管理員處理佇列
    adminQueue.push({
      type: 'cancel',
      recordId: record.id,
      timestamp: new Date().toISOString(),
      data: { ...record },
    })

    // 從紀錄中移除
    const index = records.findIndex((r) => r.id === record.id)
    if (index > -1) {
      records.splice(index, 1)
    }

    alert('取消申請已送出')
    console.log('管理員處理佇列:', adminQueue)
  }
}

// 關閉彈出視窗
const closeModal = () => {
  showDetailModal.value = false
  showReasonModal.value = false
  currentRecord.value = {}
}

onMounted(() => {
  // 如果有從表單帶新資料 → 插入紀錄
  if (route.query.date && route.query.room) {
    // 單次借用的處理
    const newRecord = {
      id: generateId(),
      date: route.query.date,
      room: route.query.room,
      time: route.query.time,
      status: '審核中',
      action: '取消申請',
      eventName: route.query.eventName || '待補充',
      peopleCount: route.query.peopleCount || '待補充',
      borrowType: route.query.borrowType || '單次借用',
      description: route.query.description || '待補充',
      borrowerName: route.query.borrowerName || '待補充',
      teacherName: route.query.teacherName || '待補充',
      borrowerDepartment: route.query.borrowerDepartment || '待補充',
      teacherDepartment: route.query.teacherDepartment || '待補充',
      borrowerEmail: route.query.borrowerEmail || '待補充',
      teacherEmail: route.query.teacherEmail || '待補充',
      borrowerPhone: route.query.borrowerPhone || '待補充',
      teacherPhone: route.query.teacherPhone || '待補充',
    }
    records.push(newRecord)
  } else if (route.query.multiStartDate && route.query.multiEndDate && route.query.room) {
    // 多次借用的處理
    const newRecord = {
      id: generateId(),
      date: `${route.query.multiStartDate} 至 ${route.query.multiEndDate}`,
      room: route.query.room,
      time:
        route.query.startTime && route.query.endTime
          ? `${route.query.startTime.slice(0, 4)} - ${route.query.endTime.slice(5, 9)}`
          : '待補充',
      status: '審核中',
      action: '取消申請',
      eventName: route.query.eventName || '待補充',
      peopleCount: route.query.peopleCount || '待補充',
      borrowType: route.query.borrowType || '多次借用',
      repeatType: route.query.repeatType || '待補充',
      multiStartDate: route.query.multiStartDate,
      multiEndDate: route.query.multiEndDate,
      description: route.query.description || '待補充',
      borrowerName: route.query.borrowerName || '待補充',
      teacherName: route.query.teacherName || '待補充',
      borrowerDepartment: route.query.borrowerDepartment || '待補充',
      teacherDepartment: route.query.teacherDepartment || '待補充',
      borrowerEmail: route.query.borrowerEmail || '待補充',
      teacherEmail: route.query.teacherEmail || '待補充',
      borrowerPhone: route.query.borrowerPhone || '待補充',
      teacherPhone: route.query.teacherPhone || '待補充',
    }
    records.push(newRecord)
  }
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
          <tr v-for="(item, i) in records" :key="i">
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
        <div class="record-card" v-for="(item, i) in records" :key="i">
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
.status-blue {
  background-color: #d1ecf1;
  color: #0c5460;
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
  .records-view h1 {
    font-size: 24px;
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
</style>
