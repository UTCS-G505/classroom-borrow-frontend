<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const role = ref('')
const errorMessage = ref('')

const handleLogin = () => {
  if (!username.value || !password.value || !role.value) {
    errorMessage.value = '請填寫所有欄位並選擇身份'
    return
  }
  if (username.value === 'admin' && password.value === '1234' && role.value === '管理員') {
    alert('登入成功！')
    errorMessage.value = ''
  } else {
    errorMessage.value = '帳號或密碼錯誤'
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="login-container">
      <h1 class="title">登入</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label">選擇身分:</label>
          <div class="role-selection">
            <button type="button" :class="{ active: role === '學生' }" @click="role = '學生'">
              學生
            </button>
            <button type="button" :class="{ active: role === '教師' }" @click="role = '教師'">
              教師
            </button>
            <button type="button" :class="{ active: role === '管理員' }" @click="role = '管理員'">
              管理員
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="label" for="username">帳號：</label>
          <input style = "color: #b0b0b0" type="text" id="username" v-model="username" placeholder="校務系統帳號" />
        </div>

        <div class="form-group">
          <label class="label" for="password">密碼：</label>
          <input type="password" id="password" v-model="password" placeholder="校務系統密碼" />
        </div>

        <button type="submit" class="login-button">登入 Sign In</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 讓整個頁面置中 */
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh; /* 垂直置中 */
  width: 100%; /* 水平置中 */
  background-color: #f2f2f2;
}

.login-container {
  width: 500px;
  padding: 30px 40px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft JhengHei', sans-serif;
}

/* 放大登入字體並置中 */
.title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

/* 放大標籤字體 */
.label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #444;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.5);
}

/* 三個角色按鈕 */
.role-selection {
  display: flex;
  justify-content: space-between;
}

.role-selection button {
  flex: 1;
  margin-right: 8px;
  padding: 10px 0;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  background-color: #f8f8f8;
  cursor: pointer;
  font-size: 16px;
  color: #b0b0b0; /* 字體顏色改為淺灰色 */
}

.role-selection button:last-child {
  margin-right: 0;
}

.role-selection button.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

/* 登入按鈕放大 */
.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #a6c8ff;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #8eb8ff;
}

.error {
  margin-top: 10px;
  color: red;
  font-size: 15px;
  text-align: center;
}

input::placeholder {
  color: #b0b0b0;
}

</style>
