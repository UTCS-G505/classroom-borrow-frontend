<script setup>
import { reactive } from "vue";

const form = reactive({
  eventName: "",
  peopleCount: "",
  classroom: "",
  borrowType: "",
  date: "",
  startTime: "",
  endTime: "",
  description: "",
  borrowerName: "",
  teacherName: "",
  borrowerDepartment: "",
  teacherDepartment: "",
  borrowerEmail: "",
  teacherEmail: "",
  borrowerPhone: "",
  teacherPhone: ""
});

let submitForm = function() {
  for (const [key, value] of Object.entries(form)) {
    if (!value) {
      alert("請填寫完整資料!");
      return; 
    }
  }

  console.log("送出資料：", form);
  alert("表單已送出！");
}

let is_num = function(event) {
  // 取得輸入的值
  let value = event.target.value;
  //如果輸入的不是數字，或是負數，就視作為空
  if (!/^\d+$/.test(value)) {
    event.target.value = "";
  }
}
</script>

<template>

  <div class="form-container">
    <h1>活動資訊</h1>
    <hr style="width: 96%; margin: 0 auto;" />

    <!-- 活動名稱 & 活動人數 -->
    <div class="row">
      <div class="field">
        <label>活動名稱</label>
        <!-- v-model的意思是雙向綁定，當輸入框的值改變時，form.eventName也會隨之改變 -->
        <input v-model="form.eventName" placeholder="請填寫活動名稱"/>
      </div>
      
      <div class="field">
        <label>活動人數</label>
        <!-- 輸入的只能是數字，或是旁邊箭頭只能是正整數加減，不能輸入中文 -->
        <input type="number" @input="is_num" v-model="form.peopleCount" placeholder="請填寫活動人數"/>
      </div>
    </div>

    <!-- 選擇教室 & 借用類型 -->
    <div class="row">
      <div class="field">
        <label>選擇教室</label>
        <select 
        v-model="form.classroom" 
        :style="{color: form.classroom === '' ? '#6c6c6c' : '#000'}">
          <option value="">請選擇教室</option>
          <option value="G312 會議室">G312 會議室</option>
          <option value="G313 普通教室">G313 普通教室</option>
          <option value="G314 普通教室">G314 普通教室</option>
          <option value="G315 電腦教室">G315 電腦教室</option>
          <option value="G316 電腦教室">G316 電腦教室</option>
          <option value="G501 會議室">G501 會議室</option>
          <option value="G508 系圖書館">G508 系圖書館</option>
          <option value="G509 IOS教室">G509 IOS教室</option>
          <option value="G516 電腦教室">G516 電腦教室</option>
        </select>
      </div>
      <div class="field">
        <label>借用類型</label>
        <div>
          <label>
            <input type="radio" value="單次借用" v-model="form.borrowType" />
            單次借用
          </label>
          <label>
            <input type="radio" value="多次借用" v-model="form.borrowType" />
            多次借用
          </label>
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
        :style="{ color: form.date === '' ? '#6c6c6c' : '#000' }" />
      </div>
      <div class="field">
        <label>活動時間(起)</label>
        <input 
        type="time"
        v-model="form.startTime"
        :style="{ color: form.startTime === '' ? '#6c6c6c' : '#000' }" />
      </div>
      <div class="field">
        <label>活動時間(迄)</label>
        <input 
        type="time"
        v-model="form.endTime"
        :style="{ color: form.endTime === '' ? '#6c6c6c' : '#000' }" />
      </div>
    </div>

    <!-- 活動內容 -->
    <div class="field">
      <label>活動內容說明</label>
      <textarea v-model="form.description" placeholder="請填寫活動內容說明"></textarea>
    </div>
  </div>

  <div class="form-container2">
    <h1>基本資料</h1>
    <hr style="width: 96%; margin: 0 auto;" />

    <!-- 借用人姓名 & 指導老師姓名 -->
    <div class="row">
      <div class="field">
        <label>借用人姓名</label>
        <!-- v-model的意思是雙向綁定，當輸入框的值改變時，form.eventName也會隨之改變 -->
        <input v-model="form.borrowerName" placeholder="請填寫借用人姓名"/>
      </div>
      
      <div class="field">
        <label>指導老師姓名(單位代表)</label>
        <input v-model="form.teacherName" placeholder="請填寫指導老師姓名"/>
      </div>
    </div>

    <!-- 借用人系級/服務單位 & 指導老師系所(單位) -->
    <div class="row">
      <div class="field">
        <label>借用人系級/服務單位</label>
        <input v-model="form.borrowerDepartment" placeholder="請填寫借用人系級/服務單位"/>
      </div>
      <div class="field">
        <label>指導老師系所(單位)</label>
        <input v-model="form.teacherDepartment" placeholder="請填寫指導老師系所(單位)"/>
      </div>
    </div>

    <!-- 借用人Email & 指導老師Email -->
    <div class="row">
      <div class="field">
        <label>借用人Email</label>
        <input v-model="form.borrowerEmail" placeholder="請填寫借用人Email"/>
      </div>
      <div class="field">
        <label>指導老師(單位)Email</label>
        <input v-model="form.teacherEmail" placeholder="請填寫指導老師(單位)Email"/>
      </div>
    </div>

    <!-- 借用人聯絡電話 & 指導老師連絡電話 -->
    <div class="row">
      <div class="field">
        <label>借用人聯絡電話</label>
        <input v-model="form.borrowerPhone" placeholder="請填寫借用人聯絡電話"/>
      </div>
      <div class="field">
        <label>指導老師(單位)聯絡電話</label>
        <input v-model="form.teacherPhone" placeholder="請填寫指導老師(單位)聯絡電話"/>
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
  display: flex;/* 調整為flex布局 */
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
