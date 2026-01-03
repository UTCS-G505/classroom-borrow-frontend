<script setup>
import { ref } from 'vue'
// 1. 刪除了沒用到的 useRouter
import axios from 'axios'

// 登入相關
const username = ref('')
const password = ref('')
const role = ref('')
const errorMessage = ref('')

// 註冊相關
const registerUsername = ref('')
const registerPassword = ref('')
const confirmPassword = ref('')
const registerServiceUnit = ref('')
const registerName = ref('')
const registerPhone = ref('')
const registerEmail = ref('')
const registerErrorMessage = ref('')

// 儲存已註冊的用戶
const registeredUsers = ref([])

// 視圖切換
const isLoginView = ref(true)

// 2. 刪除了沒用到的 const router = useRouter()

const handleLogin = async () => {
  if (!username.value || !password.value || !role.value) {
    errorMessage.value = '請填寫所有欄位並選擇身份'
    return
  }

  // --- 管理員登入 ---
  if (username.value === 'admin' && password.value === '1234' && role.value === '管理員') {
    localStorage.setItem('username', 'Admin')
    localStorage.setItem('role', '管理員')

    errorMessage.value = ''
    window.location.href = '/' // 使用 window.location 跳轉，不需要 router
    return
  }

  // --- 訪客登入 ---
  if (role.value === '訪客') {
    const user = registeredUsers.value.find(
      (u) => u.username === username.value && u.password === password.value,
    )
    if (user) {
      localStorage.setItem('username', user.name || user.username)
      localStorage.setItem('role', '訪客')

      errorMessage.value = ''
      window.location.href = '/'
      return
    } else {
      errorMessage.value = '訪客帳號或密碼錯誤'
      return
    }
  }

  // --- 學生/教師登入 (SSO API) ---
  if (role.value === '學生' || role.value === '教師') {
    try {
      errorMessage.value = '登入中...'

      // 注意：請確認您的後端 Port 是 8080 還是其他數字
      const response = await axios.post('http://localhost:3000/api/login', {
        account: username.value,
        password: password.value,
      })

      if (response.data.success) {
        errorMessage.value = ''
        console.log('SSO 登入成功', response.data)

        const userData = response.data.user_data

        if (userData && userData.access_token) {
          localStorage.setItem('token', userData.access_token)
        }

        const savedName = userData && userData.account ? userData.account : username.value
        localStorage.setItem('username', savedName)
        localStorage.setItem('role', role.value)

        window.location.href = '/' // 強制刷新
      } else {
        errorMessage.value = response.data.message || '帳號或密碼錯誤'
      }
    } catch (error) {
      console.error(error)
      if (error.code === 'ERR_NETWORK') {
        errorMessage.value = '無法連線到伺服器，請確認後端是否已啟動'
      } else if (error.response && error.response.data) {
        errorMessage.value = error.response.data.message || '登入失敗'
      } else {
        errorMessage.value = '發生未預期的錯誤'
      }
    }
    return
  }

  errorMessage.value = '帳號或密碼錯誤'
}

// --- 以下維持原樣 ---

const handleRegister = () => {
  if (
    !registerUsername.value ||
    !registerPassword.value ||
    !confirmPassword.value ||
    !registerServiceUnit.value ||
    !registerName.value ||
    !registerPhone.value ||
    !registerEmail.value
  ) {
    registerErrorMessage.value = '請填寫所有欄位'
    return
  }

  if (registeredUsers.value.some((u) => u.username === registerUsername.value)) {
    registerErrorMessage.value = '此帳號已存在'
    return
  }

  if (registerPassword.value !== confirmPassword.value) {
    registerErrorMessage.value = '密碼確認不一致'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerEmail.value)) {
    registerErrorMessage.value = 'Email格式不正確'
    return
  }

  const phoneRegex = /^[0-9]+$/
  if (!phoneRegex.test(registerPhone.value)) {
    registerErrorMessage.value = '手機號碼只能包含數字'
    return
  }

  registeredUsers.value.push({
    username: registerUsername.value,
    password: registerPassword.value,
    name: registerName.value,
    serviceUnit: registerServiceUnit.value,
    phone: registerPhone.value,
    email: registerEmail.value,
  })

  registerErrorMessage.value = ''
  alert('註冊成功！')
  switchToLogin()
}

const switchToLogin = () => {
  isLoginView.value = true
  registerUsername.value = ''
  registerPassword.value = ''
  confirmPassword.value = ''
  registerServiceUnit.value = ''
  registerName.value = ''
  registerPhone.value = ''
  registerEmail.value = ''
  registerErrorMessage.value = ''
}

const switchToRegister = () => {
  isLoginView.value = false
  username.value = ''
  password.value = ''
  role.value = ''
  errorMessage.value = ''
}
</script>

<template>
  <div class="page-wrapper">
    <div v-if="isLoginView" class="login-container">
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
            <button type="button" :class="{ active: role === '訪客' }" @click="role = '訪客'">
              訪客
            </button>
          </div>
        </div>

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
          <button type="button" class="register-button" @click="switchToRegister">
            註冊 Register
          </button>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>

    <div v-else class="register-container">
      <h1 class="title">註冊</h1>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label class="label" for="register-name">姓名：</label>
          <input
            type="text"
            id="register-name"
            v-model="registerName"
            placeholder="請輸入真實姓名"
          />
        </div>
        <div class="form-group">
          <label class="label" for="register-service-unit">服務單位：</label>
          <input
            type="text"
            id="register-service-unit"
            v-model="registerServiceUnit"
            placeholder="請輸入您的服務單位/公司/機關"
          />
        </div>
        <div class="form-group">
          <label class="label" for="register-username">帳號：</label>
          <input
            type="text"
            id="register-username"
            v-model="registerUsername"
            placeholder="請輸入帳號"
          />
        </div>
        <div class="form-group">
          <label class="label" for="register-password">密碼：</label>
          <input
            type="password"
            id="register-password"
            v-model="registerPassword"
            placeholder="請輸入密碼"
          />
        </div>
        <div class="form-group">
          <label class="label" for="confirm-password">確認密碼：</label>
          <input
            type="password"
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="請再次輸入密碼"
          />
        </div>
        <div class="form-group">
          <label class="label" for="register-phone">手機號碼：</label>
          <input
            type="tel"
            id="register-phone"
            v-model="registerPhone"
            placeholder="請輸入電話號碼"
          />
        </div>
        <div class="form-group">
          <label class="label" for="register-email">Email：</label>
          <input
            type="email"
            id="register-email"
            v-model="registerEmail"
            placeholder="example@email.com"
          />
        </div>

        <div class="button-group">
          <button type="submit" class="login-button">註冊 Register</button>
          <button type="button" class="register-button" @click="switchToLogin">返回登入</button>
        </div>

        <div class="register-hint">
          <p class="hint-text">
            <i class="info-icon">ℹ️</i> 註冊成功後，請使用「訪客」身分登入系統
          </p>
        </div>
        <p v-if="registerErrorMessage" class="error">{{ registerErrorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 原有的 CSS 保持不變 */
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
.login-container,
.register-container {
  width: 100%;
  max-width: 600px;
  padding: 40px 50px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft JhengHei', sans-serif;
  margin: auto;
}
.register-form {
  width: 100%;
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
.role-selection {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.role-selection button {
  flex: 1;
  min-width: 120px;
  padding: 12px 8px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  background-color: #f8f8f8;
  cursor: pointer;
  font-size: 16px;
  color: #b0b0b0;
}
.role-selection button.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
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
.register-hint {
  margin-top: 20px;
  text-align: center;
}
.hint-text {
  font-size: 14px;
  color: #666;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #4a90e2;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.info-icon {
  font-size: 16px;
}
@media (max-width: 768px) {
  .page-wrapper {
    padding: 20px;
  }
  .login-container,
  .register-container {
    padding: 30px 25px;
  }
  .role-selection {
    flex-direction: column;
  }
  .role-selection button {
    width: 100%;
    margin-bottom: 8px;
  }
}
@media (max-height: 700px) {
  .page-wrapper {
    align-items: flex-start;
    padding: 20px;
  }
}
</style>
