<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router' // 引入 useRoute

const route = useRoute() // 獲取當前路由

const form = reactive({
  eventName: '',
  peopleCount: '',
  classroom: '', // 教室名稱
  borrowType: '',
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
  const phoneRegex = /^\d{10}$/
  return phoneRegex.test(phone)
}

const is_num = (value) => {
  //要是正整數，不能為英文或其他語言
  const numRegex = /^\d+$/
  return numRegex.test(value)
}

const validateField = (field) => {
  if (!form[field]) {
    errors[field] = '此欄位必填'
    return false
  }

  // 活動人數為負數就不能送出，要求改為正整數，輸入的只能是正數，其他視作沒輸入
  if (field === 'peopleCount') {
    if (!is_num(form[field])) {
      errors[field] = '請輸入正整數'
      return false
    }
  }

  // 日期要大於等於今天
  if (field === 'date') {
    const today = new Date().toISOString().split('T')[0]
    if (form.date < today) {
      errors[field] = '日期必須大於等於今天'
      return false
    }
  }

  // 時間的開始時間必須早於結束時間，修改其中一個時間時都要檢查
  if (field === 'startTime' || field === 'endTime') {
    errors.startTime = '' // 清除開始時間的錯誤訊息
    errors.endTime = '' // 清除結束時間的錯誤訊息

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.startTime = '開始時間必須早於結束時間'
      errors.endTime = '結束時間必須晚於開始時間'
      return false
    }
  }

  if (field === 'borrowerEmail' || field === 'teacherEmail') {
    if (!validateEmail(form[field])) {
      errors[field] = 'Email 格式不正確'
      return false
    }
  }

  if (field === 'borrowerPhone' || field === 'teacherPhone') {
    if (!validatePhone(form[field])) {
      errors[field] = '電話格式不正確，須為10位數字'
      return false
    }
  }

  errors[field] = '' // 清除當前欄位的錯誤訊息
  return true
}

const validateAllFields = () => {
  let isValid = true
  Object.keys(form).forEach((field) => {
    if (!validateField(field)) {
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

  console.log('送出資料：', form)
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

    <!-- 日期 & 時間 -->
    <div class="row">
      <div class="field">
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
        <input
          type="time"
          v-model="form.startTime"
          :style="{ color: form.startTime === '' ? '#6c6c6c' : '#000' }"
          @input="() => validateField('startTime')"
        />
        <span class="error" v-if="errors.startTime">{{ errors.startTime }}</span>
      </div>
      <div class="field">
        <label>活動時間(迄)</label>
        <input
          type="time"
          v-model="form.endTime"
          :style="{ color: form.endTime === '' ? '#6c6c6c' : '#000' }"
          @input="() => validateField('endTime')"
        />
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
        <span class="error" v-if="errors.borrowerDepartment">{{ errors.borrowerDepartment }}</span>
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
</template>

<style>
body {
  background-color: #f6f6f5; /* 頁面背景顏色 */
}
</style>

<style scoped>
.error {
  color: red;
  font-size: 15px;
  margin-top: 5px;
}
.form-container {
  margin: auto;
  margin-top: 180px;
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

h1 {
  color: #555;
  margin-bottom: 5px;
  padding: 0 0 10px 30px;
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
  .form-container,
  .form-container2 {
    margin-top: 20px;
    padding: 10px;
    max-width: 100%; /* 滿版寬度 */
  }

  h1 {
    font-size: 20px;
    padding: 0 0 10px 10px;
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
