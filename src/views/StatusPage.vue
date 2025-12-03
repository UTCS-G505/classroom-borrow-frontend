<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const classrooms = [
  { id: 'G312', title: 'G312 會議室' },
  { id: 'G313', title: 'G313 普通教室' },
  { id: 'G314', title: 'G314 普通教室' },
  { id: 'G315', title: 'G315 電腦教室' },
  { id: 'G316', title: 'G316 電腦教室' },
  { id: 'G501', title: 'G501 會議室' },
  { id: 'G508', title: 'G508 系圖書室' },
  { id: 'G516', title: 'G516 電腦教室' },
  { id: 'G509', title: 'G509 IOS教室' },
]

const timeSlots = [
  '08:10-09:00',
  '09:10-10:00',
  '10:10-11:00',
  '11:10-12:00',
  '12:10-13:00',
  '13:10-14:00',
  '14:10-15:00',
  '15:10-16:00',
  '16:10-17:00',
  '17:10-18:00',
  '18:10-19:00',
  '19:10-20:00',
  '20:10-21:00',
  '21:10-22:00',
]

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const today = new Date()
const todayKey = getDateKey(today)

// --- 选取状态 ---
const selectionState = ref({
  dateKey: null,
  indices: [],
})

function getWeekDates(weekOffset = 0) {
  const today = new Date()
  const currentDay = today.getDay()
  const diff = today.getDate() - currentDay + weekOffset * 7
  const sunday = new Date(today.setDate(diff))
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday)
    date.setDate(sunday.getDate() + i)
    dates.push(date)
  }
  return dates
}

function formatDate(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedRoom = ref('G312')
const weekOffset = ref(0)
const scheduleData = ref({})
const error = ref('')

const weekDates = computed(() => getWeekDates(weekOffset.value))
const schedule = computed(() => scheduleData.value[selectedRoom.value] || {})

function isSelected(dateKey, tIdx) {
  return selectionState.value.dateKey === dateKey && selectionState.value.indices.includes(tIdx)
}

const sortedIndices = computed(() => {
  return [...selectionState.value.indices].sort((a, b) => a - b)
})

const isContinuous = computed(() => {
  const arr = sortedIndices.value
  if (arr.length === 0) return false
  if (arr.length === 1) return true

  const min = arr[0]
  const max = arr[arr.length - 1]
  return max - min + 1 === arr.length
})

const selectedTimeRangeDisplay = computed(() => {
  const arr = sortedIndices.value
  if (arr.length === 0) return ''

  const firstSlot = timeSlots[arr[0]]
  const lastSlot = timeSlots[arr[arr.length - 1]]

  const start = firstSlot.split('-')[0]
  const end = lastSlot.split('-')[1]

  return `${start} - ${end} (${arr.length} 節)`
})

onMounted(async () => {
  try {
    const res = await fetch('/schedule.json')
    if (!res.ok) throw new Error('HTTP error ' + res.status)
    scheduleData.value = await res.json()
  } catch (err) {
    error.value = '讀取 JSON 檔案失敗'
    console.error(err)
  }
})

// --- 點擊格子 (已加入過去日期禁止條件) ---
function toggleSlot(date, tIdx) {
  const dateKey = getDateKey(date)

  if (new Date(dateKey) < new Date(todayKey)) return // ← 不允許過去日期

  const currentKey = selectionState.value.dateKey

  if (currentKey !== dateKey) {
    selectionState.value.dateKey = dateKey
    selectionState.value.indices = [tIdx]
    return
  }

  const idxPosition = selectionState.value.indices.indexOf(tIdx)
  if (idxPosition > -1) {
    selectionState.value.indices.splice(idxPosition, 1)
    if (selectionState.value.indices.length === 0) {
      selectionState.value.dateKey = null
    }
  } else {
    selectionState.value.indices.push(tIdx)
  }
}

// StatusPage.vue

function handleConfirm() {
  if (!isContinuous.value || selectionState.value.indices.length === 0) return

  const arr = sortedIndices.value
  const firstSlot = timeSlots[arr[0]] // 例如 "08:10-09:00"
  const lastSlot = timeSlots[arr[arr.length - 1]] // 例如 "09:10-10:00"

  // 修改重點：移除冒號 (:) 以符合 BorrowRequestView 的 option value (例如 "0810-0900")
  const fmtStart = firstSlot.replace(/:/g, '')
  const fmtEnd = lastSlot.replace(/:/g, '')

  router.push({
    path: '/borrow',
    query: {
      roomId: selectedRoom.value,
      date: selectionState.value.dateKey,
      startTime: fmtStart, // 傳送格式化後的完整時段字串
      endTime: fmtEnd, // 傳送格式化後的完整時段字串
      borrowType: '單次借用',
    },
  })
}

function clearSelection() {
  selectionState.value.dateKey = null
  selectionState.value.indices = []
}

function gotoIntroductionPage() {
  router.push({
    name: 'introductionPage',
    query: { roomId: selectedRoom.value },
  })
}

function selectRoom(id) {
  selectedRoom.value = id
  clearSelection()
}
</script>

<template>
  <div class="container">
    <aside class="sidebar">
      <h2 class="sidebarTitle">可借用教室</h2>
      <ul>
        <li v-for="room in classrooms" :key="room.id">
          <span
            class="navLink"
            :class="{ active: selectedRoom === room.id }"
            @click="selectRoom(room.id)"
          >
            {{ room.title }}
          </span>
        </li>
      </ul>
    </aside>

    <nav class="mobile-nav">
      <ul>
        <li v-for="room in classrooms" :key="room.id">
          <button
            class="navBtn"
            :class="{ active: selectedRoom === room.id }"
            @click="selectRoom(room.id)"
          >
            {{ room.id }}
          </button>
        </li>
      </ul>
    </nav>

    <section class="content">
      <div class="timetable">
        <div class="header">
          <h1 class="roomTitle">{{ selectedRoom }}</h1>
          <span class="viewLabel" @click="gotoIntroductionPage()">查看教室</span>
        </div>

        <div v-if="error" class="errorMessage">{{ error }}</div>

        <div class="tableWrapper">
          <table>
            <thead>
              <tr>
                <th class="arrowCell">
                  <button @click="weekOffset--" class="arrowButton">←</button>
                </th>
                <th
                  v-for="(date, idx) in weekDates"
                  :key="idx"
                  :class="{ todayColumn: getDateKey(date) === todayKey }"
                >
                  <div>{{ weekDays[idx] }}</div>
                  <div class="dateText">{{ formatDate(date) }}</div>
                </th>
                <th class="arrowCell">
                  <button @click="weekOffset++" class="arrowButton">→</button>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(time, tIdx) in timeSlots" :key="tIdx">
                <td class="timeCell">{{ time }}</td>
                <td
                  v-for="(date, dIdx) in weekDates"
                  :key="dIdx"
                  :class="[
                    'slotCell',

                    /* 過去日期 */
                    { pastDay: new Date(getDateKey(date)) < new Date(todayKey) },

                    /* 只有未來日期 + 無排程才能點 */
                    {
                      clickable:
                        !schedule[getDateKey(date)]?.[time] &&
                        new Date(getDateKey(date)) >= new Date(todayKey),
                    },

                    { todayColumn: getDateKey(date) === todayKey },
                    { selectedSlot: isSelected(getDateKey(date), tIdx) },
                  ]"
                  @click="
                    !schedule[getDateKey(date)]?.[time] &&
                    new Date(getDateKey(date)) >= new Date(todayKey) &&
                    toggleSlot(date, tIdx)
                  "
                >
                  <div v-if="schedule[getDateKey(date)]?.[time]" class="event">
                    {{ schedule[getDateKey(date)][time] }}
                  </div>

                  <div v-else-if="!isSelected(getDateKey(date), tIdx)" class="emptySlot">+</div>

                  <div v-else class="checkMark">✔</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <transition name="slide-up">
      <div v-if="selectionState.indices.length > 0" class="selectionBar">
        <div class="selectionInfo">
          <span class="selectionDate">日期: {{ selectionState.dateKey }}</span>
          <span class="selectionTime">時間: {{ selectedTimeRangeDisplay }}</span>
          <span v-if="!isContinuous" class="selectionError">請選擇連續的時段!!!</span>
        </div>
        <div class="actionButtons">
          <button class="cancelBtn" @click="clearSelection">取消</button>
          <button class="confirmBtn" :disabled="!isContinuous" @click="handleConfirm">
            確認借用
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  flex-direction: row;
  background-color: #f6f6f5;
}

/* 側邊欄 */
.sidebar {
  width: 160px;
  background-color: #eae8e6;
  color: #333;
  padding: 1rem;
}

.sidebarTitle {
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 15px;
}

.navLink {
  display: block;
  padding: 5px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
  text-decoration: none;
}

.navLink.active,
.navLink:hover {
  background-color: #d6d3d1;
}

/* 手機版 */
.mobile-nav {
  display: none;
}

.mobile-nav ul {
  display: flex;
  gap: 0.5rem;
  padding: 0;
}

.mobile-nav li {
  list-style: none;
}

.navBtn {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.3s;
}

.navBtn.active,
.navBtn:hover {
  background: #ddd8d4;
}

/* 主內容 */
.content {
  flex: 1;
  padding: 20px;
  overflow: hidden; /* 防止內容過寬撐開整個頁面 */
}

.timetable {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.roomTitle {
  font-size: 28px;
  font-weight: 600;
}

.viewLabel {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 8px;
  background-color: transparent;
  transition: all 0.2s ease;
}

.viewLabel:hover {
  background-color: #c2ddff;
  border-color: #c2ddff;
  transform: translateY(-2px);
}

.errorMessage {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.tableWrapper {
  overflow-x: auto; /* 允許橫向捲動 */
  /* 移除原本的 margin/padding hack，這是導致露餡的主因 */
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

th,
td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
  background-color: #fff; /* 確保有背景色，避免 sticky 時文字透視 */
}

/* --- 關鍵修改：固定左上角箭頭 --- */
th.arrowCell:first-child {
  position: sticky;
  left: 0;
  z-index: 30; /* 層級最高 */
  background-color: #fff;
  border-right: 1px solid #ddd; /* 增加右側分隔線 */
  /* 新增：加上陰影，遮擋更嚴密，並與下方時間欄一致 */
  box-shadow: 4px 0 8px -4px rgba(0, 0, 0, 0.15);
}

/* --- 關鍵修改：固定左側時間欄 --- */
.timeCell {
  position: sticky;
  left: 0;
  z-index: 20; /* 層級高於普通格子 */
  background-color: #fafafa; /* 使用不透明背景，防止文字重疊 */
  font-size: 16px;
  color: #666;
  white-space: nowrap;

  border-right: 1px solid #ddd;
  box-shadow: 4px 0 8px -4px rgba(0, 0, 0, 0.15);
}

.dateText {
  font-size: 16px;
  color: #999;
}

/* 🔹 整欄標記「今天」 */
.todayColumn {
  background-color: #fafafa !important;
  position: relative;
}

/* 在表頭顯示「今天」文字提示 */
th.todayColumn::after {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 10px;
  color: #2a5b9e;
}

/* .timeCell 基本樣式已移至上方 sticky 區塊統一設定 */

.slotCell {
  min-height: 50px;
}

.slotCell.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.emptySlot {
  color: #ccc;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.2s;
}

.slotCell.clickable:hover .emptySlot {
  opacity: 1;
}

.event {
  background-color: #f0f0f0;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
}

.navigation {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.navButton {
  background-color: #b3cce6;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
}

.arrowCell {
  width: 40px;
}

.arrowButton {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #555;
  cursor: pointer;
  transition:
    color 0.2s,
    transform 0.2s;
}

.arrowButton:hover {
  color: #2a5b9e;
  transform: scale(1.1);
}

/* --- 新增樣式：選取狀態 (去藍色版) --- */

/* 被選取的格子樣式：改為中性灰 */
.selectedSlot {
  background-color: #dbeafe !important; /* Blue 100 */
  box-shadow: inset 0 0 0 1px #60a5fa; /* Blue 400 Border */
}

.checkMark {
  color: #2563eb; /* 深灰色打勾 */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}

/* --- 底部 Action Bar (淺色懸浮風格) --- */
.selectionBar {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);

  width: auto;
  min-width: 340px;
  max-width: 90%;

  /* 背景：與側邊欄一致的淺灰 (#eae8e6) */
  background: rgba(234, 232, 230, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  color: #333;
  padding: 14px 24px;
  border-radius: 100px;

  /* 陰影 */
  box-shadow:
    0 10px 30px -5px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);

  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  gap: 24px;
}

.selectionInfo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
}

.selectionDate {
  font-weight: 700;
  color: #78716c; /* 暖灰色 */
  font-size: 10px;

  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.selectionTime {
  font-weight: 700;
  font-size: 15px;
  color: #333; /* 改為近黑色，強調對比 */
  font-family: monospace;
}

.selectionError {
  position: static;
  margin-top: 4px; /* 與上方時間的距離 */

  color: #ef4444; /* 紅色警示 (在灰色系中保留紅色比較清楚) */
  font-size: 12px;
  font-weight: 700;

  display: flex;
  align-items: center;
  gap: 4px;
}

.actionButtons {
  display: flex;
  gap: 10px;
}

/* 取消按鈕 */
.cancelBtn {
  background: transparent;
  border: 1px solid #a8a29e;
  color: #57534e;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancelBtn:hover {
  background: #d6d3d1;
  color: #1c1917;
  border-color: #78716c;
}

/* 確認按鈕 - 改為深灰色實心 */
.confirmBtn {
  background: #44403c; /* 深暖灰/黑 */
  color: #fff;
  border: none;
  padding: 8px 22px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.confirmBtn:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.confirmBtn:not(:disabled):hover {
  background: #1c1917; /* Hover 變全黑 */
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
}

/* 動畫效果 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 120%);
  opacity: 0;
}

/* 過去日期（不可選） */
.pastDay {
  position: relative;
  opacity: 0.35;
  cursor: not-allowed !important;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.03) 0,
    rgba(0, 0, 0, 0.03) 6px,
    transparent 6px,
    transparent 12px
  );
}

/* 手機版 RWD */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .sidebar {
    display: none;
  }
  .mobile-nav {
    display: block;
    background-color: #eae8e6;
    padding: 0.5rem;
    overflow-x: auto;
    white-space: nowrap;
  }

  .content {
    padding: 10px;
  }

  .timetable {
    padding: 10px;
  }

  /* --- 手機版時間欄位優化 --- */
  .timeCell {
    font-size: 12px; /* 縮小字體 */
    padding: 10px 2px; /* 減少內距 */
    width: 60px; /* 固定較窄的寬度 */
    max-width: 60px;
    white-space: normal; /* 允許換行 (例如 08:00 換行 -09:00) */
    line-height: 1.2;
    text-align: center;
  }

  /* 左上角箭頭也縮小一點 */
  .arrowCell:first-child {
    min-width: 40px;
    padding: 0;
  }

  .selectionBar {
    width: 95%;
    bottom: 10px;
    padding: 12px 20px;
    border-radius: 12px;
  }

  .actionButtons {
    display: flex;
    gap: 8px;
  }

  /* 取消按鈕 */
  .cancelBtn {
    padding: 5px 15px;
  }

  .confirmBtn {
    padding: 5px 15px;
  }
}
</style>
