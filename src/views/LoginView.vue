<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// 登入相關
const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Auth store
const authStore = useAuthStore()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '請填寫所有欄位'
    return
  }

  errorMessage.value = '登入中...'

  const result = await authStore.login(username.value, password.value)

  if (result.success) {
    errorMessage.value = ''
    // navigate to previous page or home
    const redirectPath = router.currentRoute.value.query.redirect || '/'
    router.push(redirectPath)
  } else {
    errorMessage.value = result.message
  }
}

const redirectToSSO = () => {
  authStore.redirectToSSO()
}
</script>

<template>
  <div class="page-wrapper">
    <div class="login-container">
      <h1 class="title">登入</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label" for="username">帳號：</label>
          <input
            style="color: #333"
            type="text"
            id="username"
            v-model="username"
            placeholder="校務系統帳號"
          />
        </div>

        <div class="form-group">
          <label class="label" for="password">密碼：</label>
          <input
            style="color: #333"
            type="password"
            id="password"
            v-model="password"
            placeholder="校務系統密碼"
          />
        </div>

        <div class="button-group">
          <button type="submit" class="login-button">登入 Sign In</button>
          <button type="button" class="register-button" @click="redirectToSSO">
            註冊 Register
          </button>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #f2f2f2;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.login-container {
  width: 100%;
  max-width: 600px;
  padding: 40px 50px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft JhengHei', sans-serif;
  margin: auto;
}
.title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
.label {
  display: block;
  margin-bottom: 10px;
  font-size: 18px;
  color: #444;
}
.form-group {
  margin-bottom: 20px;
}
input {
  width: 100%;
  padding: 14px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  color: #333;
}
input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.5);
}
.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}
.login-button {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  background-color: #a6c8ff;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.login-button:hover {
  background-color: #8eb8ff;
}
.register-button {
  padding: 14px 24px;
  font-size: 18px;
  background-color: transparent;
  color: #4a90e2;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: underline;
}
.register-button:hover {
  background-color: #f0f7ff;
  text-decoration: none;
}
.error {
  margin-top: 10px;
  color: red;
  font-size: 16px;
  text-align: center;
}
input::placeholder {
  color: #b0b0b0;
}
@media (max-width: 768px) {
  .page-wrapper {
    padding: 20px;
  }
  .login-container {
    padding: 30px 25px;
  }
}
@media (max-height: 700px) {
  .page-wrapper {
    align-items: flex-start;
    padding: 20px;
  }
}
</style>
