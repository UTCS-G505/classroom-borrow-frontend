<script setup>
import { ref, onMounted, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useToastStore } from '@/stores/toast'
import adminApi from '@/api/admin.api'

const toastStore = useToastStore()
const schedules = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)

const start_date = ref('')
const end_date = ref('')

const previewSchedules = ref([])
const isPreviewing = ref(false)

const previewTimeSlots = computed(() => {
  if (!previewSchedules.value.length) return []

  return [
    { start: '08:10:00', end: '09:00:00' },
    { start: '09:10:00', end: '10:00:00' },
    { start: '10:10:00', end: '11:00:00' },
    { start: '11:10:00', end: '12:00:00' },
    { start: '12:10:00', end: '13:00:00' },
    { start: '13:10:00', end: '14:00:00' },
    { start: '14:10:00', end: '15:00:00' },
    { start: '15:10:00', end: '16:00:00' },
    { start: '16:10:00', end: '17:00:00' },
    { start: '17:10:00', end: '18:00:00' },
    { start: '18:10:00', end: '19:00:00' },
    { start: '19:10:00', end: '20:00:00' },
    { start: '20:10:00', end: '21:00:00' },
    { start: '21:10:00', end: '22:00:00' },
  ]
})

const getPreviewCell = (weekday, slot) => {
  return previewSchedules.value.filter((s) => {
    if (s.weekday !== weekday) return false
    // Overlapping logic: course starts BEFORE slot ends, AND ends AFTER slot starts.
    return s.start_time < slot.end && s.end_time > slot.start
  })
}

const submitPreview = async () => {
  isSubmitting.value = true
  try {
    await adminApi.importSchedule({
      schedules: previewSchedules.value,
      start_date: start_date.value,
      end_date: end_date.value,
    })
    toastStore.showToast('課表匯入成功', 'success')
    isPreviewing.value = false
    previewSchedules.value = []
    fetchSchedules()
  } catch (err) {
    console.error(err)
    toastStore.showToast('匯入失敗，請確認檔案資料', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const cancelPreview = () => {
  isPreviewing.value = false
  previewSchedules.value = []
}

async function fetchSchedules() {
  isLoading.value = true
  try {
    const res = await adminApi.getAllSchedules()
    schedules.value = res.data
  } catch (err) {
    console.error(err)
    toastStore.showToast('無法載入課表', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSchedules()
})

const groupedSchedules = computed(() => {
  const groups = {}
  schedules.value.forEach((item) => {
    const key = `${item.semester_start_date.substring(0, 10)}_${item.semester_end_date.substring(0, 10)}`
    if (!groups[key]) {
      groups[key] = {
        start: item.semester_start_date.substring(0, 10),
        end: item.semester_end_date.substring(0, 10),
        items: [],
      }
    }
    groups[key].items.push(item)
  })
  return Object.values(groups).sort((a, b) => b.start.localeCompare(a.start))
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!start_date.value || !end_date.value) {
    toastStore.showToast('請先選擇學期開始與結束日期', 'error')
    e.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = async (event) => {
    try {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false })

      const parsedSchedules = json.map((row) => {
        const classroom = row['教室'] || row['classroom']
        const course = row['課程名稱'] || row['course']
        const teacher = row['授課教師'] || row['teacher']
        const weekdayRaw = row['星期'] || row['weekday']
        const startTime = (row['開始時間'] || row['start_time'] || '').toString()
        const endTime = (row['結束時間'] || row['end_time'] || '').toString()

        let weekdayNum = parseInt(weekdayRaw)
        if (isNaN(weekdayNum)) {
          const map = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0 }
          weekdayNum = map[weekdayRaw] !== undefined ? map[weekdayRaw] : 1
        } else if (weekdayNum === 7) {
          weekdayNum = 0 // Sunday
        }

        let formattedStart = startTime.includes(':')
          ? startTime
          : `${startTime.padStart(2, '0')}:00`
        let formattedEnd = endTime.includes(':') ? endTime : `${endTime.padStart(2, '0')}:00`

        if (formattedStart.length === 4) formattedStart = '0' + formattedStart
        if (formattedEnd.length === 4) formattedEnd = '0' + formattedEnd

        return {
          classroom_id: String(classroom),
          course_name: String(course),
          teacher_name: String(teacher),
          weekday: weekdayNum,
          start_time: formattedStart,
          end_time: formattedEnd,
        }
      })

      if (parsedSchedules.length === 0) {
        toastStore.showToast('Excel 中沒有找到資料', 'error')
        return
      }

      previewSchedules.value = parsedSchedules.filter((s) => s.classroom_id && s.course_name)
      isPreviewing.value = true
    } catch (err) {
      console.error(err)
      toastStore.showToast('檔案解析失敗，請確認檔案格式', 'error')
    } finally {
      e.target.value = ''
    }
  }
  reader.readAsArrayBuffer(file)
}

const deleteSemester = async (start, end) => {
  if (!confirm(`確定要刪除 ${start} 到 ${end} 的所有課表嗎？此動作無法復原！`)) return
  isSubmitting.value = true
  try {
    await adminApi.deleteSemesterSchedules(start, end)
    toastStore.showToast('學期課表已刪除', 'success')
    fetchSchedules()
  } catch (err) {
    console.error(err)
    toastStore.showToast('刪除失敗', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const confirmClear = async () => {
  if (!confirm('確定要清除系統內的所有課表嗎？此動作極其危險且無法復原！')) return
  isSubmitting.value = true
  try {
    await adminApi.clearSchedules()
    toastStore.showToast('所有課表已完全清除', 'success')
    fetchSchedules()
  } catch (err) {
    console.error(err)
    toastStore.showToast('清除失敗', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function getWeekdayName(num) {
  const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return names[num]
}
</script>

<template>
  <div v-if="isLoading" class="loading">
    <div class="spinner"></div>
    <p>載入中...</p>
  </div>

  <template v-else>
    <section class="list">
      <div class="header-container">
        <h3>固定課表管理</h3>
        <button class="btn btn-delete" @click="confirmClear" :disabled="isSubmitting">
          清除所有課表
        </button>
      </div>

      <div v-if="!isPreviewing" class="import-section form-content">
        <h4 style="margin-bottom: 15px; color: #333">匯入新學期課表</h4>
        <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap">
          <div class="form-group">
            <label>學期開始日期</label>
            <input type="date" v-model="start_date" class="form-input" />
          </div>
          <div class="form-group">
            <label>學期結束日期</label>
            <input type="date" v-model="end_date" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label
            >上傳 Excel 檔案 (包含欄位：教室, 課程名稱, 授課教師, 星期, 開始時間, 結束時間)</label
          >
          <input
            type="file"
            accept=".xlsx, .xls"
            @change="handleFileUpload"
            class="form-input"
            :disabled="isSubmitting"
          />
        </div>
        <p style="font-size: 13px; color: #666; margin-top: 10px">
          如果上傳相同的學期區間，會自動覆蓋（更新）該學期的課表，不影響其他學期。
        </p>
      </div>

      <div v-else class="preview-section form-content">
        <h4 style="margin-bottom: 15px; color: #333">
          匯入預覽 ({{ start_date }} 至 {{ end_date }})
        </h4>
        <div class="table-container">
          <table class="preview-table">
            <thead>
              <tr>
                <th style="width: 80px"></th>
                <th>一</th>
                <th>二</th>
                <th>三</th>
                <th>四</th>
                <th>五</th>
                <th>六</th>
                <th>日</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(slot, index) in previewTimeSlots" :key="index">
                <td class="time-slot-cell">
                  第 {{ index + 1 }} 節<br />
                  <span style="font-size: 12px; color: #666">
                    {{ slot.start.substring(0, 5).replace(':', '') }}-{{
                      slot.end.substring(0, 5).replace(':', '')
                    }}
                  </span>
                </td>
                <td v-for="day in [1, 2, 3, 4, 5, 6, 0]" :key="day">
                  <div
                    v-for="course in getPreviewCell(day, slot)"
                    :key="course.course_name + course.classroom_id"
                    class="course-card"
                  >
                    <div class="course-name">{{ course.course_name }}</div>
                    <div class="course-teacher">{{ course.teacher_name }}</div>
                    <div class="course-classroom">{{ course.classroom_id }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="preview-actions">
          <button
            class="btn"
            style="background-color: #e2e8f0; color: #475569"
            @click="cancelPreview"
            :disabled="isSubmitting"
          >
            取消匯入
          </button>
          <button
            class="btn"
            style="background-color: #0b6bc8; color: white"
            @click="submitPreview"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">匯入中...</span>
            <span v-else>確認匯入</span>
          </button>
        </div>
      </div>

      <!-- Schedule Table Grouped by Semester -->
      <div class="tab-content">
        <template v-if="groupedSchedules.length > 0">
          <div
            v-for="group in groupedSchedules"
            :key="group.start + '_' + group.end"
            class="semester-group"
          >
            <div class="semester-header">
              <h4 style="margin: 0; color: #333; font-size: 16px">
                學期：{{ group.start }} 至 {{ group.end }}
              </h4>
              <button
                class="btn btn-delete btn-sm"
                @click="deleteSemester(group.start, group.end)"
                :disabled="isSubmitting"
              >
                刪除此學期
              </button>
            </div>
            <table style="margin-bottom: 30px">
              <thead>
                <tr>
                  <th>教室</th>
                  <th>課程名稱</th>
                  <th>授課教師</th>
                  <th>星期</th>
                  <th>開始時間</th>
                  <th>結束時間</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in group.items" :key="item.schedule_id">
                  <td>{{ item.classroom_id }}</td>
                  <td>{{ item.course_name }}</td>
                  <td>{{ item.teacher_name }}</td>
                  <td>{{ getWeekdayName(item.weekday) }}</td>
                  <td>{{ item.start_time.substring(0, 5) }}</td>
                  <td>{{ item.end_time.substring(0, 5) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <p v-else class="empty-state">目前系統內沒有課表資料</p>
      </div>
    </section>
  </template>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}
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

.semester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f5f9;
  padding: 12px 15px;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e2e8f0;
  border-bottom: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 15px;
  border: 1px solid #e2e8f0;
  border-top: none;
}
thead {
  background-color: #f8f9fa;
  border-top: 1px solid #e2e8f0;
}
th {
  color: #555;
  padding: 12px 12px;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}
td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  color: #444;
}
tbody tr:hover {
  background-color: #f8f9fa;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
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
  font-weight: 500;
}
.form-group {
  flex: 1;
  min-width: 200px;
}

.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.import-section,
.preview-section {
  margin-bottom: 25px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #0b6bc8;
}

.table-container {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-bottom: 15px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
  min-width: 800px;
  border: none;
}
.preview-table thead {
  border: none;
}
.preview-table th,
.preview-table td {
  border: 1px solid #cbd5e1;
  padding: 10px;
  vertical-align: top;
  text-align: left;
}
.preview-table th {
  background-color: #f1f5f9;
  text-align: center;
  color: #475569;
  font-weight: 600;
  border-bottom: 1px solid #cbd5e1;
}
.preview-table td {
  background-color: #fffdf5;
  width: 13%;
  border-bottom: 1px solid #cbd5e1;
}
.preview-table .time-slot-cell {
  background-color: #f8f9fa;
  text-align: center;
  vertical-align: middle;
  color: #555;
  width: 80px;
}
.course-card {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ccc;
  line-height: 1.4;
}
.course-card:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.course-name {
  color: #333;
}
.course-teacher {
  color: #666;
  font-size: 13px;
}
.course-classroom {
  color: #666;
  font-size: 13px;
}

.preview-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

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
.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}
.btn-delete {
  background-color: #fee2e2;
  color: #dc2626;
}
.btn-delete:hover {
  background-color: #fecaca;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
