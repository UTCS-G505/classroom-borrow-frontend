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
  '12:00-13:00',
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

// 今天日期 key
const today = new Date()
const todayKey = getDateKey(today)

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

//連接至申請借用頁
function handleSlotClick(date, timeSlot) {
  const dateKey = getDateKey(date)
  router.push({
    path: '/borrow',
    query: {
      roomId: selectedRoom.value, // 教室
      date: dateKey, // 單次借用日期
      startTime: timeSlot.split('-')[0], // 起始時間
      endTime: timeSlot.split('-')[1], // 結束時間
      borrowType: '單次借用', // 自動選擇單次借用
    },
  })
}

//連接至教室介紹頁
function gotoIntroductionPage() {
  router.push({
    name: 'introductionPage',
    query: {
      roomId: selectedRoom.value,
    },
  })
}
</script>

<template>
  <div class="container">
    <!-- 側邊導覽列 -->
    <aside class="sidebar">
      <h2 class="sidebarTitle">可借用教室</h2>
      <ul>
        <li v-for="room in classrooms" :key="room.id">
          <span
            class="navLink"
            :class="{ active: selectedRoom === room.id }"
            @click="selectedRoom = room.id"
          >
            {{ room.title }}
          </span>
        </li>
      </ul>
    </aside>

    <!-- 手機版頂部導覽列 -->
    <nav class="mobile-nav">
      <ul>
        <li v-for="room in classrooms" :key="room.id">
          <button
            class="navBtn"
            :class="{ active: selectedRoom === room.id }"
            @click="selectedRoom = room.id"
          >
            {{ room.id }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- 主內容區 -->
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
                    { clickable: !schedule[getDateKey(date)]?.[time] },
                    { todayColumn: getDateKey(date) === todayKey },
                  ]"
                  @click="!schedule[getDateKey(date)]?.[time] && handleSlotClick(date, time)"
                >
                  <div v-if="schedule[getDateKey(date)]?.[time]" class="event">
                    {{ schedule[getDateKey(date)][time] }}
                  </div>
                  <div v-else class="emptySlot">+</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
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
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th,
td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
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

.timeCell {
  background-color: #fafafa;
  font-size: 16px;
  color: #666;
  white-space: nowrap;
}

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
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background-color: #f6f6f5;
}
</style>
