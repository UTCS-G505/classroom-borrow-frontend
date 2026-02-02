<script setup>
import { reactive, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 引入 useRoute
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { bookingsApi } from '@/api/bookings.api'

const route = useRoute() // 獲取當前路由->讀取資料
const router = useRouter() // 獲取路由實例->導航跳轉
const userStore = useUserStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// 當前階段 (1, 2, 3)
const currentStage = ref(1)
const isSubmitting = ref(false)

// const result = reactive({})

const form = reactive({
  eventName: '',
  peopleCount: '',
  classroom: '', // 教室名稱
  borrowType: '',
  repeatType: '', //多次借用的頻率選擇
  multiStartDate: '', //多次借用的起始日期
  multiEndDate: '', //多次借用的結束日期
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  borrowerName: '',
  teacherName: '',
  borrowerDepartment: '',
  teacherDepartment: '',
  borrowerEmail: '',
  teacherEmail: '',
  borrowerPhone: '',
  teacherPhone: '',
})

const errors = reactive({
  eventName: '',
  peopleCount: '',
  classroom: '',
  borrowType: '',
  repeatType: '',
  multiStartDate: '',
  multiEndDate: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  borrowerName: '',
  teacherName: '',
  borrowerDepartment: '',
  teacherDepartment: '',
  borrowerEmail: '',
  teacherEmail: '',
  borrowerPhone: '',
  teacherPhone: '',
})

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\-() ]+$/ // 數字 、 - 、 () 和空格的正則表達式
  return phoneRegex.test(phone)
}

const is_num = (value) => {
  //要是正整數，不能為英文或其他語言
  const numRegex = /^\d+$/
  return numRegex.test(value)
}

const validateField = (field) => {
  // 清除當前欄位的錯誤訊息
  errors[field] = ''

  if (!form[field]) {
    if (
      form.borrowType == '單次借用' &&
      (field === 'multiStartDate' || field === 'multiEndDate' || field == 'repeatType')
    ) {
      return true // 單次借用不需要多次借用的日期
    } else if (form.borrowType == '多次借用' && field === 'date') {
      return true // 多次借用不需要單次借用的日期，但仍需要活動時間
    } else {
      errors[field] = '此欄位必填'
      return false
    }
  }

  // 活動人數必須為正整數
  if (field === 'peopleCount') {
    if (!is_num(form[field]) || parseInt(form[field]) <= 0) {
      errors[field] = '活動人數必須為正整數'
      return false
    }
  }

  // Email 格式判斷
  if (field === 'borrowerEmail' || field === 'teacherEmail') {
    if (!validateEmail(form[field])) {
      errors[field] = 'Email 格式不正確'
      return false
    }
  }

  // 電話格式判斷
  if (field === 'borrowerPhone' || field === 'teacherPhone') {
    if (!validatePhone(form[field])) {
      errors[field] = '電話格式不正確，請輸入有效的電話號碼'
      return false
    }
  }

  //日期判斷:今天以前的日期都設為不能選取
  if (field === 'date' || field === 'multiStartDate' || field === 'multiEndDate') {
    const today = new Date()
    const inputDate = new Date(form[field])

    // 檢查日期是否在今天之前
    if (inputDate < today) {
      errors[field] = '日期不能小於等於今天'
      return false
    }
  }

  // 時間的開始時間必須早於結束時間
  if (field === 'startTime' || field === 'endTime') {
    errors.startTime = '' // 清除開始時間的錯誤訊息
    errors.endTime = '' // 清除結束時間的錯誤訊息

    if (form.startTime && form.endTime && form.startTime > form.endTime) {
      errors.startTime = '開始時間必須早於結束時間'
      errors.endTime = '結束時間必須晚於開始時間'
      return false
    }
  }

  // 多次借用的起始日期和結束日期判斷
  if (field === 'multiStartDate' || field === 'multiEndDate') {
    errors.multiStartDate = '' // 清除起始日期的錯誤訊息
    errors.multiEndDate = '' // 清除結束日期的錯誤訊息

    if (form.multiStartDate && form.multiEndDate && form.multiStartDate >= form.multiEndDate) {
      errors.multiStartDate = '起始日期必須早於結束日期'
      errors.multiEndDate = '結束日期必須晚於起始日期'
      return false
    }
  }

  errors[field] = '' // 清除當前欄位的錯誤訊息
  return true
}

// 階段 1 的驗證函數
const validateStage1 = () => {
  const stage1Fields = ['classroom', 'peopleCount', 'borrowType']

  // 根據借用類型添加相應的時間欄位
  if (form.borrowType === '單次借用') {
    stage1Fields.push('date', 'startTime', 'endTime')
  } else if (form.borrowType === '多次借用') {
    stage1Fields.push('multiStartDate', 'multiEndDate', 'repeatType', 'startTime', 'endTime')
  }

  let isValid = true
  stage1Fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  return isValid
}

// 階段 2 的驗證函數
const validateStage2 = () => {
  const stage2Fields = ['eventName', 'description']
  let isValid = true
  stage2Fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  return isValid
}

// 階段 3 的驗證函數
const validateStage3 = () => {
  const stage3Fields = [
    'borrowerName',
    'teacherName',
    'borrowerDepartment',
    'teacherDepartment',
    'borrowerEmail',
    'teacherEmail',
    'borrowerPhone',
    'teacherPhone',
  ]
  let isValid = true
  stage3Fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  return isValid
}

// 前往下一階段
const nextStage = () => {
  let canProceed = false

  if (currentStage.value === 1) {
    canProceed = validateStage1()
    if (!canProceed) {
      toastStore.showToast('請完成基本借用資訊！', 'warning')
      return
    }
  } else if (currentStage.value === 2) {
    canProceed = validateStage2()
    if (!canProceed) {
      toastStore.showToast('請完成活動資訊！', 'warning')
      return
    }
  }

  if (canProceed && currentStage.value < 3) {
    currentStage.value++
  }
}

// 回到上一階段
const prevStage = () => {
  if (currentStage.value > 1) {
    currentStage.value--
  }
}

// -------------------------------------------------------------------
// 👇 修改後的 submitForm 函式 (串接後端寄信)
// -------------------------------------------------------------------
const submitForm = async () => {
  // 1. 驗證表單
  if (!validateStage3()) {
    toastStore.showToast('請修正表單中的錯誤！', 'warning')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    // Get user_id from user profile
    const userId = userStore.userId.value

    if (!userId) {
      toastStore.showToast('無法取得用戶資訊，請重新登入', 'error')
      router.push('/login')
      return
    }

    // Helper function to convert time format (e.g., "0810-0900" -> "08:10")
    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      const start = timeStr.split('-')[0]
      if (start.length === 4) {
        return `${start.slice(0, 2)}:${start.slice(2, 4)}`
      }
      return start
    }

    const formatEndTime = (timeStr) => {
      if (!timeStr) return ''
      const end = timeStr.split('-')[1]
      if (end && end.length === 4) {
        return `${end.slice(0, 2)}:${end.slice(2, 4)}`
      }
      return end || ''
    }

    const bookingData = {
      user_id: userId,
      classroom_id: form.classroom,
      borrow_type: form.borrowType,
      start_date: form.borrowType === '多次借用' ? form.multiStartDate : form.date,
      end_date: form.borrowType === '多次借用' ? form.multiEndDate : null,
      start_time: formatTime(form.startTime),
      end_time: formatEndTime(form.endTime),
      event_name: form.eventName,
      people_count: parseInt(form.peopleCount),
      teacher_name: form.teacherName,
      reason: form.description,
      teacher_department: form.teacherDepartment,
      teacher_phone: form.teacherPhone,
      teacher_email: form.teacherEmail,
      borrower_department: form.borrowerDepartment,
      borrower_phone: form.borrowerPhone,
      borrower_email: form.borrowerEmail,
    }

    const response = await bookingsApi.createBooking(bookingData)

    if (response.status === 200) {
      // Object.keys(form).forEach((key) => {
      //   result[key] = form[key]
      // })

      // // 清空表單資料
      // Object.keys(form).forEach((key) => {
      //   form[key] = ''
      // })

      // 清空錯誤訊息
      // Object.keys(errors).forEach((key) => {
      //   errors[key] = ''
      // })

      // Navigate to records page
      toastStore.showToast('借用申請已提交', 'success')
      router.push({ path: '/record' })

      // 重置到第一階段
      currentStage.value = 1
    }
  } catch (error) {
    console.error('提交失敗:', error)
    if (error.response?.status === 409) {
      toastStore.showToast('時段已被預約，請選擇其他時段', 'error')
    } else if (error.response?.status === 401) {
      toastStore.showToast('請先登入', 'error')
      router.push({ path: '/login' })
    } else if (error.response?.status === 403) {
      toastStore.showToast('您沒有權限進行此操作', 'error')
    } else {
      toastStore.showToast(error.response?.data?.message || '提交失敗，請稍後再試', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

// 在組件掛載時設置教室名稱
// 在組件掛載時設置教室名稱與預填資料
onMounted(() => {
  const query = route.query

  // 1. 帶入教室 ID
  if (query.roomId) {
    form.classroom = query.roomId
  }

  // 2. 帶入借用類型 (必須先設定，因為這會影響欄位顯示邏輯)
  if (query.borrowType) {
    form.borrowType = query.borrowType
  }

  // 3. 帶入日期
  if (query.date) {
    form.date = query.date
  }

  // 4. 帶入開始與結束時間
  // 注意：這裡的值必須完全對應 <option value="..."> 的內容
  if (query.startTime) {
    form.startTime = query.startTime
  }

  if (query.endTime) {
    form.endTime = query.endTime
  }

  // 如果用戶已登入，自動填充借用人資訊
  if (authStore.isLoggedIn.value && userStore.profile) {
    autoFillBorrowerInfo()
  }
})

// 監聽用戶登入狀態和 profile 變化，自動填充借用人資訊
watch(
  () => [authStore.isLoggedIn.value, userStore.profile],
  () => {
    if (authStore.isLoggedIn.value && userStore.profile) {
      autoFillBorrowerInfo()
    }
  },
  { deep: true },
)

// 自動填充借用人資訊的函數
const autoFillBorrowerInfo = () => {
  if (userStore.profile) {
    if (!form.borrowerName) {
      form.borrowerName = userStore.username || ''
    }
    if (!form.borrowerEmail) {
      form.borrowerEmail = userStore.email || ''
    }
    if (!form.borrowerPhone) {
      form.borrowerPhone = userStore.phone_number || ''
    }
    if (!form.borrowerDepartment) {
      form.borrowerDepartment =
        userStore.role && 0 <= userStore.role.value && userStore.role.value <= 4 ? '資科系' : ''
    }
  }
}
</script>

<template>
  <div class="borrow-view">
    <h1 style="padding: 0px 0px 0px 10px">借用申請</h1>
    <hr />

    <div class="stage-indicator">
      <div class="stage-item" :class="{ active: currentStage === 1, completed: currentStage > 1 }">
        <div class="stage-number">1</div>
        <div class="stage-title">基本借用資訊</div>
      </div>
      <div class="stage-divider"></div>
      <div class="stage-item" :class="{ active: currentStage === 2, completed: currentStage > 2 }">
        <div class="stage-number">2</div>
        <div class="stage-title">活動資訊</div>
      </div>
      <div class="stage-divider"></div>
      <div class="stage-item" :class="{ active: currentStage === 3 }">
        <div class="stage-number">3</div>
        <div class="stage-title">聯絡資訊</div>
      </div>
    </div>

    <div v-if="currentStage === 1" class="form-container">
      <h1>基本借用資訊</h1>
      <hr style="width: 96%; margin: 0 auto" />

      <div class="row">
        <div class="field">
          <label>選擇教室</label>
          <select
            @change="() => validateField('classroom')"
            v-model="form.classroom"
            :style="{ color: form.classroom === '' ? '#6c6c6c' : '#000' }"
          >
            <option value="">請選擇教室</option>
            <option value="G312">G312 會議室</option>
            <option value="G313">G313 普通教室</option>
            <option value="G314">G314 普通教室</option>
            <option value="G315">G315 電腦教室</option>
            <option value="G316">G316 電腦教室</option>
            <option value="G501">G501 會議室</option>
            <option value="G508">G508 系圖書館</option>
            <option value="G509">G509 IOS教室</option>
            <option value="G516">G516 電腦教室</option>
          </select>
          <span class="error" v-if="errors.classroom">{{ errors.classroom }}</span>
        </div>

        <div class="field">
          <label>活動人數</label>
          <input
            type="number"
            v-model="form.peopleCount"
            placeholder="請填寫活動人數"
            @input="() => validateField('peopleCount')"
          />
          <span class="error" v-if="errors.peopleCount">{{ errors.peopleCount }}</span>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>借用類型</label>
          <div class="radio-group">
            <label>
              <input
                type="radio"
                value="單次借用"
                v-model="form.borrowType"
                @change="() => validateField('borrowType')"
              />
              單次借用
            </label>
            <label>
              <input
                type="radio"
                value="多次借用"
                v-model="form.borrowType"
                @change="() => validateField('borrowType')"
              />
              多次借用
            </label>
            <span class="error" v-if="errors.borrowType">{{ errors.borrowType }}</span>
          </div>
        </div>
      </div>

      <div v-if="form.borrowType === '多次借用'" class="row">
        <div class="field">
          <label>頻率</label>
          <select
            v-model="form.repeatType"
            @change="() => validateField('repeatType')"
            :style="{ color: form.repeatType === '' ? '#6c6c6c' : '#000' }"
          >
            <option value="">請選擇頻率</option>
            <option value="每天">每天</option>
            <option value="每周">每周</option>
          </select>
          <span class="error" v-if="errors.repeatType">{{ errors.repeatType }}</span>
        </div>

        <div class="field">
          <label>起始日期</label>
          <input
            type="date"
            v-model="form.multiStartDate"
            @input="() => validateField('multiStartDate')"
            :style="{ color: form.multiStartDate === '' ? '#6c6c6c' : '#000' }"
          />
          <span class="error" v-if="errors.multiStartDate">{{ errors.multiStartDate }}</span>
        </div>

        <div class="field">
          <label>結束日期</label>
          <input
            type="date"
            v-model="form.multiEndDate"
            @input="() => validateField('multiEndDate')"
            :style="{ color: form.multiEndDate === '' ? '#6c6c6c' : '#000' }"
          />
          <span class="error" v-if="errors.multiEndDate">{{ errors.multiEndDate }}</span>
        </div>
      </div>

      <div class="row">
        <div class="field" v-if="form.borrowType !== '多次借用'">
          <label>選擇日期</label>
          <input
            type="date"
            v-model="form.date"
            :style="{ color: form.date === '' ? '#6c6c6c' : '#000' }"
            @input="() => validateField('date')"
          />
          <span class="error" v-if="errors.date">{{ errors.date }}</span>
        </div>

        <div class="field">
          <label>活動時間(起)</label>
          <select
            v-model="form.startTime"
            @change="() => validateField('startTime')"
            :style="{ color: form.startTime === '' ? '#6c6c6c' : '#000' }"
          >
            <option value="">請選取活動開始時段</option>
            <option value="0810-0900">第 1 節 0810-0900</option>
            <option value="0910-1000">第 2 節 0910-1000</option>
            <option value="1010-1100">第 3 節 1010-1100</option>
            <option value="1110-1200">第 4 節 1110-1200</option>
            <option value="1210-1300">第 5 節 1210-1300</option>
            <option value="1310-1400">第 6 節 1310-1400</option>
            <option value="1410-1500">第 7 節 1410-1500</option>
            <option value="1510-1600">第 8 節 1510-1600</option>
            <option value="1610-1700">第 9 節 1610-1700</option>
            <option value="1710-1800">第 10 節 1710-1800</option>
            <option value="1810-1900">第 11 節 1810-1900</option>
            <option value="1910-2000">第 12 節 1910-2000</option>
            <option value="2010-2100">第 13 節 2010-2100</option>
            <option value="2110-2200">第 14 節 2110-2200</option>
          </select>
          <span class="error" v-if="errors.startTime">{{ errors.startTime }}</span>
        </div>
        <div class="field">
          <label>活動時間(迄)</label>
          <select
            v-model="form.endTime"
            @change="() => validateField('endTime')"
            :style="{ color: form.endTime === '' ? '#6c6c6c' : '#000' }"
          >
            <option value="">請選取活動結束時段</option>
            <option value="0810-0900">第 1 節 0810-0900</option>
            <option value="0910-1000">第 2 節 0910-1000</option>
            <option value="1010-1100">第 3 節 1010-1100</option>
            <option value="1110-1200">第 4 節 1110-1200</option>
            <option value="1210-1300">第 5 節 1210-1300</option>
            <option value="1310-1400">第 6 節 1310-1400</option>
            <option value="1410-1500">第 7 節 1410-1500</option>
            <option value="1510-1600">第 8 節 1510-1600</option>
            <option value="1610-1700">第 9 節 1610-1700</option>
            <option value="1710-1800">第 10 節 1710-1800</option>
            <option value="1810-1900">第 11 節 1810-1900</option>
            <option value="1910-2000">第 12 節 1910-2000</option>
            <option value="2010-2100">第 13 節 2010-2100</option>
            <option value="2110-2200">第 14 節 2110-2200</option>
          </select>
          <span class="error" v-if="errors.endTime">{{ errors.endTime }}</span>
        </div>
      </div>
    </div>

    <div v-if="currentStage === 2" class="form-container">
      <h1>活動資訊</h1>
      <hr style="width: 96%; margin: 0 auto" />

      <div class="field">
        <label>活動名稱</label>
        <input
          v-model="form.eventName"
          @input="() => validateField('eventName')"
          placeholder="請填寫活動名稱"
        />
        <span class="error" v-if="errors.eventName">{{ errors.eventName }}</span>
      </div>

      <div class="field">
        <label>活動內容說明</label>
        <textarea
          v-model="form.description"
          placeholder="請填寫活動內容說明"
          @input="() => validateField('description')"
        ></textarea>
        <span class="error" v-if="errors.description">{{ errors.description }}</span>
      </div>
    </div>

    <div v-if="currentStage === 3" class="form-container">
      <h1>聯絡資訊</h1>
      <hr style="width: 96%; margin: 0 auto" />

      <div class="row">
        <div class="field">
          <label>借用人姓名</label>
          <input
            v-model="form.borrowerName"
            placeholder="請填寫借用人姓名"
            @input="() => validateField('borrowerName')"
          />
          <span class="error" v-if="errors.borrowerName">{{ errors.borrowerName }}</span>
        </div>

        <div class="field">
          <label>指導老師姓名(單位代表)</label>
          <input
            v-model="form.teacherName"
            placeholder="請填寫指導老師姓名"
            @input="() => validateField('teacherName')"
          />
          <span class="error" v-if="errors.teacherName">{{ errors.teacherName }}</span>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>借用人系級/服務單位</label>
          <input
            v-model="form.borrowerDepartment"
            placeholder="請填寫借用人系級/服務單位"
            @input="() => validateField('borrowerDepartment')"
          />
          <span class="error" v-if="errors.borrowerDepartment">{{
            errors.borrowerDepartment
          }}</span>
        </div>
        <div class="field">
          <label>指導老師系所(單位)</label>
          <input
            v-model="form.teacherDepartment"
            placeholder="請填寫指導老師系所(單位)"
            @input="() => validateField('teacherDepartment')"
          />
          <span class="error" v-if="errors.teacherDepartment">{{ errors.teacherDepartment }}</span>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>借用人Email</label>
          <input
            v-model="form.borrowerEmail"
            placeholder="請填寫借用人Email"
            @input="() => validateField('borrowerEmail')"
          />
          <span class="error" v-if="errors.borrowerEmail">{{ errors.borrowerEmail }}</span>
        </div>
        <div class="field">
          <label>指導老師(單位)Email</label>
          <input
            v-model="form.teacherEmail"
            placeholder="請填寫指導老師(單位)Email"
            @input="() => validateField('teacherEmail')"
          />
          <span class="error" v-if="errors.teacherEmail">{{ errors.teacherEmail }}</span>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>借用人聯絡電話</label>
          <input
            v-model="form.borrowerPhone"
            placeholder="請填寫借用人聯絡電話"
            @input="() => validateField('borrowerPhone')"
          />
          <span class="error" v-if="errors.borrowerPhone">{{ errors.borrowerPhone }}</span>
        </div>
        <div class="field">
          <label>指導老師(單位)聯絡電話</label>
          <input
            v-model="form.teacherPhone"
            placeholder="請填寫指導老師(單位)聯絡電話"
            @input="() => validateField('teacherPhone')"
          />
          <span class="error" v-if="errors.teacherPhone">{{ errors.teacherPhone }}</span>
        </div>
      </div>
    </div>

    <div class="navigation-buttons">
      <button v-if="currentStage > 1" @click="prevStage" class="btn-prev">上一步</button>
      <button v-if="currentStage < 3" @click="nextStage" class="btn-next">下一步</button>
      <button
        v-if="currentStage === 3"
        @click="submitForm"
        class="btn-submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '提交中...' : '送出申請' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.borrow-view {
  max-width: 1000px;
  margin: 40px auto;
  color: #666;
}
.borrow-view h1 {
  font-size: 30px;
  margin-bottom: 20px;
}

.error {
  color: red;
  font-size: 15px;
  margin-top: 5px;
}

/* 階段指示器樣式 */
.stage-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px auto;
  padding: 20px;
  width: 100%;
  max-width: 600px;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 0 0 auto;
}

.stage-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}

.stage-item.active .stage-number {
  background-color: #c2ddff;
  color: #333;
}

.stage-item.completed .stage-number {
  background-color: #4caf50;
  color: white;
}

.stage-title {
  font-size: 14px;
  color: #888;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
}

.stage-item.active .stage-title {
  color: #333;
}

.stage-item.completed .stage-title {
  color: #4caf50;
}

.stage-divider {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 15px;
  margin-bottom: 25px;
  max-width: 180px;
  min-width: 30px;
}

.form-container {
  margin: auto;
  margin-top: 60px;
  background-color: #ffffff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 15px 15px 25px 15px;
  max-width: 1130px;
  font-family: Arial, sans-serif;
}

.row {
  display: flex;
  margin-bottom: 15px;
}

.field {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

label {
  font-size: 25px;
  color: #777;
  font-weight: bold;
  margin-bottom: 5px;
}

input {
  height: 30px;
  background-color: #f0f0f0;
  padding: 10px;
  font-size: 21px;
  border: 1px solid #aaaaaa;
  border-radius: 10px;
}

input[type='radio'] {
  width: 10px;
  height: 10px;
  margin-right: 8px;
  transform: scale(1.5);
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
}

.field label {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 21px;
  cursor: pointer;
}

.field div {
  display: flex;
  gap: 20px;
  align-items: center;
}

.radio-group {
  display: flex !important;
  flex-direction: row !important;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.field div label {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  margin-right: 0;
}
select {
  height: 50px;
  background-color: #f0f0f0;
  padding: 10px;
  appearance: none;
  font-size: 21px;
  border: 1px solid #aaaaaa;
  border-radius: 10px;
}

textarea {
  min-height: 80px;
  height: 50px;
  background-color: #f0f0f0;
  padding: 10px;
  appearance: none;
  font-size: 21px;
  border: 1px solid #aaaaaa;
  border-radius: 10px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 40px auto;
  max-width: 1130px;
}

.navigation-buttons button {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  min-width: 120px;
}

.btn-prev {
  background-color: #f0f0f0;
  color: #666;
}

.btn-prev:hover {
  background-color: #e0e0e0;
}

.btn-next {
  background-color: #c2ddff;
  color: #333;
}

.btn-next:hover {
  background-color: #a7c5eb;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
}

.btn-submit:hover {
  background-color: #45a049;
}

/* 手機板樣式 */
@media (max-width: 768px) {
  .borrow-view h1 {
    margin: 20px 15px;
    font-size: 24px;
  }

  .stage-indicator {
    margin: 20px auto;
    padding: 10px 5px;
    max-width: 400px;
  }

  .stage-item {
    flex: 0 0 auto;
  }

  .stage-number {
    width: 35px;
    height: 35px;
    font-size: 16px;
    margin-bottom: 6px;
  }

  .stage-title {
    font-size: 12px;
    white-space: nowrap;
    text-align: center;
  }

  .stage-divider {
    margin: 0 8px;
    margin-bottom: 18px;
    max-width: 60px;
    min-width: 25px;
  }

  .form-container {
    margin-top: 20px;
    padding: 10px;
    max-width: 100%;
  }

  .borrow-view {
    margin: 15px;
  }
  .form-container,
  .form-container2 {
    margin-top: 20px;
    padding: 10px;
    max-width: 100%; /* 滿版寬度 */
  }

  .row {
    flex-direction: column;
    margin-bottom: 10px;
  }

  .field {
    padding: 10px;
  }

  label {
    font-size: 18px;
  }

  /* 手機版單選按鈕樣式 */
  input[type='radio'] {
    transform: scale(1.3);
    margin-right: 6px;
  }

  .field label {
    font-size: 18px;
  }

  /* 手機版單選按鈕容器 */
  .field div {
    flex-direction: column;
    gap: 10px;
  }

  /* 借用類型單選按鈕保持橫向排列 */
  .radio-group {
    flex-direction: row !important;
    gap: 15px !important;
    justify-content: flex-start;
    align-items: center;
  }

  .field div label {
    font-size: 18px;
  }

  input,
  select,
  textarea {
    font-size: 18px;
    padding: 8px;
  }

  .navigation-buttons {
    flex-direction: row;
    gap: 15px;
    padding: 0 20px;
    justify-content: center;
  }

  .navigation-buttons button {
    font-size: 16px;
    padding: 12px 20px;
    min-width: auto;
    flex: 1;
    max-width: 150px;
  }
}

/* 平板樣式 */
@media (max-width: 1024px) and (min-width: 769px) {
  .stage-indicator {
    padding: 15px 10px;
    max-width: 500px;
  }

  .stage-divider {
    max-width: 120px;
    min-width: 30px;
    margin: 0 10px;
    margin-bottom: 25px;
  }
}

@media (max-width: 480px) {
  .stage-indicator {
    margin: 15px auto;
    padding: 8px 2px;
    max-width: 300px;
  }

  .stage-number {
    width: 30px;
    height: 30px;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .stage-title {
    font-size: 10px;
    text-align: center;
  }

  .stage-divider {
    margin: 0 5px;
    margin-bottom: 15px;
    max-width: 40px;
    min-width: 15px;
  }

  .radio-group {
    gap: 12px !important;
  }

  .radio-group label {
    font-size: 16px !important;
  }

  .navigation-buttons {
    gap: 10px;
    padding: 0 15px;
  }

  .navigation-buttons button {
    font-size: 14px;
    padding: 10px 15px;
    max-width: 120px;
  }
}
</style>
