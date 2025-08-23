<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router' // 引入 useRoute

const route = useRoute() // 獲取當前路由

const result = reactive({})

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
    } else if (
      form.borrowType == '多次借用' &&
      (field === 'date' || field === 'startTime' || field === 'endTime')
    ) {
      return true // 多次借用不需要單次借用的日期
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

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
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

const validateAllFields = () => {
  let isValid = true
  Object.keys(form).forEach((field) => {
    const fieldValid = validateField(field)
    if (!fieldValid) {
      isValid = false
    }
  })
  return isValid
}

const submitForm = () => {
  if (!validateAllFields()) {
    alert('請修正表單中的錯誤！')
    return
  }

  Object.keys(form).forEach((key) => {
    result[key] = form[key] // 將表單資料複製到 result
  })

  console.log('送出資料：', result)
  alert('表單已送出！')

  // 清空表單資料
  Object.keys(form).forEach((key) => {
    form[key] = ''
  })

  // 清空錯誤訊息
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

// 在組件掛載時設置教室名稱
onMounted(() => {
  const roomId = route.query.roomId // 獲取 query 中的 roomId
  if (roomId) {
    form.classroom = roomId // 將 roomId 設置到 form.classroom
  }
})
</script>

<template>
  <div class="borrow-view">
    <h1 style="padding: 0">借用申請</h1>
    <hr />
    <div class="form-container">
      <h1>活動資訊</h1>
      <hr style="width: 96%; margin: 0 auto" />

      <!-- 活動名稱 & 活動人數 -->
      <div class="row">
        <div class="field">
          <label>活動名稱</label>
          <!-- v-model的意思是雙向綁定，當輸入框的值改變時，form.eventName也會隨之改變 -->
          <input
            v-model="form.eventName"
            @input="() => validateField('eventName')"
            placeholder="請填寫活動名稱"
          />
          <span class="error" v-if="errors.eventName">{{ errors.eventName }}</span>
        </div>

        <div class="field">
          <label>活動人數</label>
          <!-- 輸入的只能是數字，或是旁邊箭頭只能是正整數加減，不能輸入中文 -->
          <input
            type="number"
            v-model="form.peopleCount"
            placeholder="請填寫活動人數"
            @input="() => validateField('peopleCount')"
          />
          <span class="error" v-if="errors.peopleCount">{{ errors.peopleCount }}</span>
        </div>
      </div>

      <!-- 選擇教室 & 借用類型 -->
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
          <label>借用類型</label>
          <div>
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

      <!-- 顯示多次借用的額外選項 -->
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

      <!-- 日期 & 時間 -->
      <div class="row">
        <!-- 單次借用時顯示選擇日期 -->
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

        <!-- 活動時間 -->
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

      <!-- 活動內容 -->
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

    <div class="form-container2">
      <h1>基本資料</h1>
      <hr style="width: 96%; margin: 0 auto" />

      <!-- 借用人姓名 & 指導老師姓名 -->
      <div class="row">
        <div class="field">
          <label>借用人姓名</label>
          <!-- v-model的意思是雙向綁定，當輸入框的值改變時，form.eventName也會隨之改變 -->
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

      <!-- 借用人系級/服務單位 & 指導老師系所(單位) -->
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

      <!-- 借用人Email & 指導老師Email -->
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

      <!-- 借用人聯絡電話 & 指導老師連絡電話 -->
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
    <!-- 按鈕 -->
    <button @click="submitForm">送出申請</button>
  </div>
</template>

<style scoped>
.borrow-view {
  max-width: 1000px;
  margin: 15px;
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
.form-container2 {
  margin: auto;
  margin-top: 80px;
  background-color: #ffffff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 15px 15px 25px 15px;
  max-width: 1130px;
  font-family: Arial, sans-serif;
}

.row {
  display: flex; /* 調整為flex布局 */
  margin-bottom: 15px; /* 調整底部間距 */
}

.field {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

label {
  /* 字大一點&顏色淺一點 */
  font-size: 25px;
  color: #777;
  /* 字體加粗 */
  font-weight: bold;
  margin-bottom: 5px;
}

input {
  height: 30px;
  background-color: #f0f0f0;
  /* 字大一點 */
  padding: 10px;
  font-size: 21px;
  /* 邊框圓一點 */
  border: 1px solid #aaaaaa;
  border-radius: 10px;
  /* 框長一點 */
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

button {
  display: block; /* 讓按鈕成為區塊元素 */
  width: 100%;
  max-width: 1158px; /* 與 .form-container 和 .form-container2 的寬度一致 */
  margin: 40px auto; /* 上下留空間，並讓按鈕水平置中 */
  padding: 15px 0; /* 增加按鈕的高度 */
  background-color: #c2ddff;
  color: 555;
  border: none;
  border-radius: 10px; /* 圓角與容器一致 */
  font-size: 25px; /* 調整字體大小 */
  cursor: pointer;
}

button:hover {
  background-color: #a7c5eb;
}

/* 手機板樣式 */
@media (max-width: 768px) {
  .borrow-view h1 {
    margin: 20px 15px;
    font-size: 24px;
  }
  .form-container,
  .form-container2 {
    margin-top: 20px;
    padding: 10px;
    max-width: 100%; /* 滿版寬度 */
  }

  .row {
    flex-direction: column; /* 垂直排列 */
    margin-bottom: 10px;
  }

  .field {
    padding: 10px;
  }

  label {
    font-size: 18px;
  }

  input,
  select,
  textarea {
    font-size: 18px;
    padding: 8px;
  }

  button {
    font-size: 20px;
    padding: 10px 0;
  }
}
</style>
